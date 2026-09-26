import { after, NextRequest, NextResponse } from "next/server";
import { buildJourney, closingLine, dedupeStops, openerLine, polishStops } from "@/lib/journey";
import { recallStops, rememberStops } from "@/lib/lastStops";
import { applyPick } from "@/lib/pick";
import { analyseMessage, llmAvailable, smallTalk } from "@/lib/llm";
import { getProfile } from "@/lib/profiles";
import { recordPurchase, shopperForPhone } from "@/lib/purchases";
import type { JourneyStop, VerdictKind } from "@/lib/types";
import {
  claimOnce,
  getWassistApiKey,
  getWassistWebhookSecret,
  inboundBodyKey,
  inboundMessageKey,
  INBOUND_BODY_DEDUPE_TTL_MS,
  isInboundMessageEvent,
  isLifecycleEvent,
  sendWassistText,
  sendWassistUnified,
  verifyWassistSignature,
  type WassistMessageEvent,
  type WassistSendResult,
} from "@/lib/wassist";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Max WhatsApp messages per inbound text: 1 opener + up to this many stops. */
const MAX_STOPS = 5;

/** Only this event starts a reply. Legacy message.received is ack'd and ignored. */
const REPLY_EVENT = "subscription.message.received";

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
    llmConfigured: llmAvailable(),
  });
}

// ---------------------------------------------------------------------------
// Miranda's WhatsApp copy. Cold, short. Verdict lines come from lib/verdict.ts;
// opener / closing lines from lib/journey.ts (shared with the web chat).
// ---------------------------------------------------------------------------

function footerFor(kind: VerdictKind): string {
  switch (kind) {
    case "suggest":
      return "Wear it.";
    case "bad":
      return "No.";
    default:
      return "If you insist.";
  }
}

function stopCaption(stop: JourneyStop): string {
  return `${stop.product.title} — £${stop.product.priceGbp}\n${stop.verdict.because}`;
}

/**
 * Send the whole journey: one text opener, then one picture message per stop
 * (photo + caption + "Link" button). Stops after the first hard failure so a
 * dead conversation does not get five error round-trips. Each product/link
 * is sent at most once (deduped by id and URL before the loop).
 */
async function replyWithJourney(
  conversationId: string,
  want: string,
  stops: JourneyStop[],
  deliveryId: string,
  openerOverride?: string,
): Promise<void> {
  const unique = dedupeStops(stops).slice(0, MAX_STOPS);
  const results: WassistSendResult[] = [];
  const started = Date.now();

  const opener = await sendWassistText(
    conversationId,
    openerOverride ?? openerLine(want, unique),
  );
  results.push(opener);

  if (opener.ok) {
    for (const stop of unique) {
      const result = await sendWassistUnified(conversationId, {
        text: stopCaption(stop),
        mediaUrl: stop.imageUrl,
        footer: footerFor(stop.verdict.kind),
        button: { text: "Link", url: stop.href },
      });
      results.push(result);
      if (!result.ok) break;
    }
    const close = openerOverride ? null : closingLine(unique);
    if (close && results.every((r) => r.ok) && unique.length > 1) {
      results.push(await sendWassistText(conversationId, close));
    }
  }

  const failed = results.find((r) => !r.ok);
  const summary = results
    .map((r) => `${r.shape ?? "?"}:${r.ok ? "ok" : r.status}`)
    .join(",");
  const hrefs = unique.map((s) => s.href).join("|");
  if (failed) {
    console.error(
      `[wassist] reply incomplete delivery=${deliveryId} sent=${summary} ` +
        `stops=${unique.length} hrefs=${hrefs} error=${failed.error ?? ""} ` +
        `ms=${Date.now() - started}`,
    );
  } else {
    console.log(
      `[wassist] replied delivery=${deliveryId} sent=${summary} ` +
        `stops=${unique.length} hrefs=${hrefs} ms=${Date.now() - started}`,
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
 *   subscription.message.received -> reply (deduped)
 *   message.received -> 200, no reply (avoids dual fan-out with subscription)
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

  // Dual fan-out: Wassist may deliver both subscription.message.received and
  // legacy message.received for one inbound. Only the subscription event replies;
  // acknowledging the legacy event stops retries without doubling cards.
  if (eventName !== REPLY_EVENT) {
    console.log(
      `[wassist] ignoring ${eventName} (reply only on ${REPLY_EVENT}) delivery=${deliveryId}`,
    );
    return NextResponse.json({
      ok: true,
      ignored: eventName,
      reason: `reply only on ${REPLY_EVENT}`,
    });
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
  // Dedupe 2: same inbound message.id (covers any remaining dual-path race).
  const messageKey = inboundMessageKey(event);
  if (messageKey && !claimOnce(messageKey)) {
    console.log(
      `[wassist] duplicate inbound ignored event=${eventName} delivery=${deliveryId}`,
    );
    return NextResponse.json({ ok: true, duplicate: "message", event: eventName });
  }
  // Dedupe 3: same conversation + body within a few seconds (no message.id, or
  // a second delivery id for the same text).
  const bodyKey = inboundBodyKey(event);
  if (bodyKey && !claimOnce(bodyKey, Date.now(), INBOUND_BODY_DEDUPE_TTL_MS)) {
    console.log(
      `[wassist] duplicate body ignored event=${eventName} delivery=${deliveryId}`,
    );
    return NextResponse.json({ ok: true, duplicate: "body", event: eventName });
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

  const prior = recallStops(`wa:${conversationId}`);
  const picked = text ? applyPick(text, prior) : null;
  if (picked) {
    after(() =>
      replyWithJourney(conversationId, want, picked.stops, deliveryId, picked.opener),
    );
    return NextResponse.json({
      ok: true,
      event: eventName,
      picked: true,
      opener: picked.opener,
      stops: picked.stops.map((s) => s.product.id),
      hrefs: picked.stops.map((s) => s.href),
    });
  }

  // Optional language layer (lib/llm.ts): purchase reports and small talk get
  // one cold line and never start a journey. No key or any failure -> journey.
  if (text && llmAvailable()) {
    const analysis = await analyseMessage(text);
    const shopperId = shopperForPhone(event.from ?? event.contact?.phoneNumber ?? event.phoneNumber);
    if (analysis?.purchase) {
      const rec = recordPurchase(shopperId, analysis.purchase);
      after(() => sendWassistText(conversationId, rec.line));
      return NextResponse.json({
        ok: true,
        event: eventName,
        purchase: analysis.purchase,
        shopper: shopperId,
        historyCount: rec.profile.purchases.length,
        reply: rec.line,
      });
    }
    if (analysis?.intent.isSmallTalk && !analysis.intent.isShoppingAsk) {
      const line = (await smallTalk(text, getProfile(shopperId).name)) ?? "State what you need.";
      after(() => sendWassistText(conversationId, line));
      return NextResponse.json({ ok: true, event: eventName, smallTalk: true, reply: line });
    }
  }

  const stops = dedupeStops(await buildJourney(want, undefined, base));
  if (stops.length > 0) rememberStops(`wa:${conversationId}`, stops);
  const planned = 1 + Math.min(stops.length, MAX_STOPS);

  // Ack now; polish lines (optional LLM) and send after the response is flushed.
  after(async () => {
    await polishStops(stops).catch(() => stops);
    await replyWithJourney(conversationId, want, stops, deliveryId);
  });

  return NextResponse.json({
    ok: true,
    event: eventName,
    routing: event.routing ?? null,
    base,
    queued: planned,
    stops: stops.slice(0, MAX_STOPS).map((s) => s.product.id),
    hrefs: stops.slice(0, MAX_STOPS).map((s) => s.href),
  });
}
