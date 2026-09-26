import { after, NextRequest, NextResponse } from "next/server";
import { buildJourney, closingLine, openerLine } from "@/lib/journey";
import type { JourneyStop, VerdictKind } from "@/lib/types";
import {
  claimOnce,
  getWassistApiKey,
  getWassistWebhookSecret,
  inboundMessageKey,
  isInboundMessageEvent,
  isLifecycleEvent,
  sendWassistText,
  sendWassistUnified,
  verifyWassistSignature,
  type WassistMessageEvent,
  type WassistSendResult,
} from "@/lib/wassist";

export const runtime = "nodejs";

/** Max WhatsApp messages per inbound text: 1 opener + up to this many stops. */
const MAX_STOPS = 5;

function hostBase(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

/** Health check for webhook setup. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "miranda-wassist",
    apiKeyConfigured: Boolean(getWassistApiKey()),
    webhookSecretConfigured: Boolean(getWassistWebhookSecret()),
  });
}

// ---------------------------------------------------------------------------
// Miranda's WhatsApp copy. Cold, short. Verdict lines come from lib/verdict.ts;
// opener / closing lines from lib/journey.ts (shared with the web chat).
// ---------------------------------------------------------------------------

function footerFor(kind: VerdictKind): string {
  switch (kind) {
    case "suggest":
      return "Miranda: yes.";
    case "bad":
      return "Miranda: bad take.";
    default:
      return "Miranda: if you must.";
  }
}

function stopCaption(stop: JourneyStop): string {
  const where = stop.product.source === "web" ? " · wider web" : "";
  return `${stop.product.title} — £${stop.product.priceGbp}${where}\n${stop.verdict.because}`;
}

/**
 * Send the whole journey: one text opener, then one picture message per stop
 * (photo + caption + "See it" button). Stops after the first hard failure so a
 * dead conversation does not get five error round-trips.
 */
async function replyWithJourney(
  conversationId: string,
  want: string,
  stops: JourneyStop[],
  deliveryId: string,
): Promise<void> {
  const results: WassistSendResult[] = [];
  const started = Date.now();

  const opener = await sendWassistText(conversationId, openerLine(want, stops));
  results.push(opener);

  if (opener.ok) {
    for (const stop of stops.slice(0, MAX_STOPS)) {
      const result = await sendWassistUnified(conversationId, {
        text: stopCaption(stop),
        mediaUrl: stop.imageUrl,
        footer: footerFor(stop.verdict.kind),
        button: { text: "See it", url: stop.href },
      });
      results.push(result);
      if (!result.ok) break;
    }
    const close = closingLine(stops.slice(0, MAX_STOPS));
    if (close && results.every((r) => r.ok) && stops.length > 1) {
      results.push(await sendWassistText(conversationId, close));
    }
  }

  const failed = results.find((r) => !r.ok);
  const summary = results
    .map((r) => `${r.shape ?? "?"}:${r.ok ? "ok" : r.status}`)
    .join(",");
  if (failed) {
    console.error(
      `[wassist] reply incomplete delivery=${deliveryId} sent=${summary} ` +
        `error=${failed.error ?? ""} ms=${Date.now() - started}`,
    );
  } else {
    console.log(
      `[wassist] replied delivery=${deliveryId} sent=${summary} ms=${Date.now() - started}`,
    );
  }
}

/**
 * Wassist webhook receiver.
 * Point the dashboard webhook URL at: https://<deploy>/api/wassist
 *
 * Docs: https://docs.wassist.app/concepts/webhooks
 * Routing: https://docs.wassist.app/guides/webhooks/routing
 *
 * Signature check (HMAC-SHA256 over `t.rawBody`, header `t=,v1=`) runs on the
 * RAW request body when WASSIST_WEBHOOK_SECRET is set. Bad or missing signatures
 * get 401 (4xx = Wassist does not retry).
 *
 * Events:
 *   subscription.message.received / message.received -> reply (deduped)
 *   test.ping, subscription.* lifecycle, anything else -> 200, no reply
 *
 * We ack with 200 immediately and send replies in `after()` so the webhook
 * never approaches Wassist's 10s limit (slow = failure = retry = duplicates).
 */
export async function POST(req: NextRequest) {
  // Read the exact bytes Wassist signed. Do not JSON.parse before verifying.
  const rawBody = await req.text();
  const signature = req.headers.get("x-wassist-signature");
  const deliveryId = req.headers.get("x-wassist-delivery") ?? "unknown";
  const headerEvent = req.headers.get("x-wassist-event") ?? "unknown";

  const check = verifyWassistSignature(rawBody, signature);
  if (!check.ok) {
    // Never log the secret or the full header/body here.
    console.error(
      `[wassist] signature verification FAILED (${check.reason}); ` +
        `event=${headerEvent} delivery=${deliveryId} ` +
        `signaturePresent=${Boolean(signature)} bodyBytes=${rawBody.length}`,
    );
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }
  if (check.skipped) {
    console.warn(
      `[wassist] WASSIST_WEBHOOK_SECRET not set; accepted UNSIGNED request ` +
        `(env=${process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown"}, ` +
        `event=${headerEvent} delivery=${deliveryId})`,
    );
  }

  let event: WassistMessageEvent;
  try {
    event = JSON.parse(rawBody) as WassistMessageEvent;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const eventName = event.event ?? headerEvent;

  // Dashboard "Send test event" — acknowledge, no reply.
  if (eventName === "test.ping") {
    return NextResponse.json({ ok: true, event: eventName });
  }

  // subscription.activated / revoked / service_window.* — context only.
  if (isLifecycleEvent(eventName)) {
    return NextResponse.json({ ok: true, ignored: eventName, lifecycle: true });
  }

  if (!isInboundMessageEvent(eventName)) {
    return NextResponse.json({ ok: true, ignored: eventName });
  }

  const conversationId = event.conversationId;
  if (!conversationId) {
    return NextResponse.json(
      { error: "missing conversationId" },
      { status: 400 },
    );
  }

  // Dedupe 1: Wassist retries reuse X-Wassist-Delivery.
  if (deliveryId !== "unknown" && !claimOnce(`delivery:${deliveryId}`)) {
    return NextResponse.json({ ok: true, duplicate: "delivery" });
  }
  // Dedupe 2: same inbound message arriving as both
  // subscription.message.received and legacy message.received.
  const messageKey = inboundMessageKey(event);
  if (messageKey && !claimOnce(messageKey)) {
    console.log(
      `[wassist] duplicate inbound ignored event=${eventName} delivery=${deliveryId}`,
    );
    return NextResponse.json({ ok: true, duplicate: "message", event: eventName });
  }

  if (!getWassistApiKey()) {
    console.error("[wassist] WASSIST_API_KEY missing — cannot reply");
    // Still 200 so Wassist does not retry forever during misconfig.
    return NextResponse.json({
      ok: false,
      error: "WASSIST_API_KEY not configured",
    });
  }

  const text = (event.message?.body ?? "").trim();
  const want = text || "something to wear";
  const base = hostBase(req);
  const stops = await buildJourney(want, undefined, base);
  const planned = 1 + Math.min(stops.length, MAX_STOPS);

  // Ack now; send after the response is flushed.
  after(() => replyWithJourney(conversationId, want, stops, deliveryId));

  return NextResponse.json({
    ok: true,
    event: eventName,
    routing: event.routing ?? null,
    base,
    queued: planned,
    stops: stops.slice(0, MAX_STOPS).map((s) => s.product.id),
  });
}
