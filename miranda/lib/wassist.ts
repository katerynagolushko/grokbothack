import crypto from "node:crypto";
import { Wassist, WassistSignatureVerificationError } from "@wassist/sdk";

const WASSIST_API_BASE =
  process.env.WASSIST_API_BASE?.replace(/\/$/, "") ??
  "https://backend.wassist.app/api/v1";

export type WassistInboundMessage = {
  id?: string;
  body?: string | null;
  media?: unknown[];
  buttons?: unknown[];
  referral?: unknown;
};

/**
 * Envelope shared by message.received, subscription.message.received and the
 * subscription lifecycle events. Lifecycle events carry `message: null`.
 * Docs: https://docs.wassist.app/guides/webhooks/routing
 */
export type WassistMessageEvent = {
  event: string;
  timestamp?: string;
  conversationId?: string;
  from?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  contact?: { name?: string; phoneNumber?: string; id?: string };
  message?: WassistInboundMessage | null;
  latestReferral?: unknown;
  /** "webhook" on subscription.* events. */
  routing?: string;
  webhookId?: string;
};

/** Inbound customer text we should answer. */
export const INBOUND_MESSAGE_EVENTS = new Set([
  "subscription.message.received",
  "message.received",
]);

/** Lifecycle / service-window events: acknowledge with 200, never reply. */
export const LIFECYCLE_EVENTS = new Set([
  "subscription.activated",
  "subscription.revoked",
  "subscription.service_window.expiring",
  "subscription.service_window.closed",
]);

export function isLifecycleEvent(event: string | undefined): boolean {
  return Boolean(event && (LIFECYCLE_EVENTS.has(event) || event.startsWith("subscription.service_window.")));
}

// ---------------------------------------------------------------------------
// Dedupe: Wassist retries with the same X-Wassist-Delivery, and a conversation
// in webhook routing can receive BOTH subscription.message.received and the
// legacy message.received for one inbound. Prefer replying only to
// subscription.message.received (route ignores message.received). In-memory
// keys still catch same-instance retries; serverless instances do not share
// memory, so also untick "message.received" in the Wassist dashboard.
// ---------------------------------------------------------------------------

const DEDUPE_TTL_MS = 10 * 60 * 1000;
/** Short window for conversation+body: stops a second fan-out of the same text. */
export const INBOUND_BODY_DEDUPE_TTL_MS = 20 * 1000;
const DEDUPE_MAX_KEYS = 2000;
const seenKeys = new Map<string, number>();

function pruneSeen(now: number) {
  for (const [key, expires] of seenKeys) {
    if (expires <= now) seenKeys.delete(key);
  }
  // Hard cap so a flood cannot grow memory without bound.
  while (seenKeys.size > DEDUPE_MAX_KEYS) {
    const oldest = seenKeys.keys().next().value;
    if (oldest === undefined) break;
    seenKeys.delete(oldest);
  }
}

/**
 * Returns true the first time a key is seen within the TTL, false afterwards.
 * Pass any stable identifier: delivery ID, or `conv:<id>:msg:<id>`.
 */
export function claimOnce(
  key: string,
  now: number = Date.now(),
  ttlMs: number = DEDUPE_TTL_MS,
): boolean {
  pruneSeen(now);
  const expires = seenKeys.get(key);
  if (expires !== undefined && expires > now) return false;
  seenKeys.set(key, now + ttlMs);
  return true;
}

/** Stable key for one inbound WhatsApp message regardless of which event carried it. */
export function inboundMessageKey(event: WassistMessageEvent): string | undefined {
  const conv = event.conversationId;
  const msgId = event.message?.id;
  if (!conv || !msgId) return undefined;
  return `conv:${conv}:msg:${msgId}`;
}

/**
 * Fallback when message.id is missing: same conversation + same body within a
 * few seconds is treated as one inbound (covers dual event fan-out).
 */
export function inboundBodyKey(event: WassistMessageEvent): string | undefined {
  const conv = event.conversationId;
  const body = (event.message?.body ?? "").trim().toLowerCase();
  if (!conv || !body) return undefined;
  return `conv:${conv}:body:${body}`;
}

/** Test hook: clear dedupe state. */
export function resetDedupeForTests() {
  seenKeys.clear();
}

export function getWassistApiKey(): string | undefined {
  const key = process.env.WASSIST_API_KEY?.trim();
  return key || undefined;
}

export function getWassistWebhookSecret(): string | undefined {
  const secret = process.env.WASSIST_WEBHOOK_SECRET?.trim();
  return secret || undefined;
}

/** Replay-protection window, in seconds (matches Wassist docs and SDK). */
const SIGNATURE_TOLERANCE_SECONDS = 300;

export type WassistSignatureResult =
  | { ok: true; skipped: boolean; via: "sdk" | "hmac" | "none" }
  | { ok: false; reason: string };

/**
 * Sign a raw body the way Wassist does: HMAC-SHA256 hex over `${t}.${rawBody}`.
 * Exported for tests / local signed requests. Never log the secret.
 */
export function signWassistPayload(
  rawBody: string,
  secret: string,
  timestampSeconds: number = Math.floor(Date.now() / 1000),
): { header: string; t: string; v1: string } {
  const t = String(timestampSeconds);
  const v1 = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");
  return { header: `t=${t},v1=${v1}`, t, v1 };
}

/**
 * Dependency-free check of X-Wassist-Signature (Stripe-style `t=<unix>,v1=<hex>`).
 * Algorithm per https://docs.wassist.app/concepts/webhooks :
 *   v1 == HMAC-SHA256(secret, `${t}.${rawBody}`) as hex, constant-time compare,
 *   and |now - t| <= 300s.
 * `rawBody` must be the exact bytes received, not re-serialised JSON.
 */
export function verifyWassistSignatureHmac(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): WassistSignatureResult {
  if (!signatureHeader) {
    return { ok: false, reason: "missing X-Wassist-Signature header" };
  }

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(",")) {
    const i = segment.indexOf("=");
    if (i === -1) continue;
    parts[segment.slice(0, i).trim()] = segment.slice(i + 1).trim();
  }
  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) {
    return {
      ok: false,
      reason: "malformed X-Wassist-Signature header (expected t=<unix>,v1=<hex>)",
    };
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");

  let matches = false;
  try {
    const a = Buffer.from(v1, "hex");
    const b = Buffer.from(expected, "hex");
    matches = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    matches = false;
  }
  if (!matches) {
    return { ok: false, reason: "signature mismatch" };
  }

  // Replay protection: reject events more than 5 minutes off from now.
  const tsNum = Number(ts);
  const age = Math.abs(Date.now() / 1000 - tsNum);
  if (!Number.isFinite(tsNum) || age > SIGNATURE_TOLERANCE_SECONDS) {
    return {
      ok: false,
      reason: `timestamp outside ${SIGNATURE_TOLERANCE_SECONDS}s tolerance`,
    };
  }

  return { ok: true, skipped: false, via: "hmac" };
}

/**
 * Verify X-Wassist-Signature when a secret is configured.
 *
 * Primary path: the official `@wassist/sdk` helper (`Wassist.webhooks.constructEvent`).
 * Fallback: our own HMAC implementation above (same algorithm) if the SDK throws
 * anything other than a verification error, e.g. a runtime/import problem.
 *
 * When no secret is set we accept the request (local stub / before the webhook
 * exists in the dashboard) and report `skipped: true` so the caller can warn.
 * With a secret set, unsigned or badly signed requests are always rejected.
 */
export function verifyWassistSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined = getWassistWebhookSecret(),
): WassistSignatureResult {
  if (!secret) return { ok: true, skipped: true, via: "none" };

  try {
    Wassist.webhooks.constructEvent(rawBody, signatureHeader, secret, {
      tolerance: SIGNATURE_TOLERANCE_SECONDS,
    });
    return { ok: true, skipped: false, via: "sdk" };
  } catch (err) {
    if (err instanceof WassistSignatureVerificationError) {
      // The SDK parses JSON after checking the HMAC. A JSON error here means the
      // signature itself was fine; let the route report "invalid JSON" instead.
      if (/parse webhook payload/i.test(err.message)) {
        return { ok: true, skipped: false, via: "sdk" };
      }
      return { ok: false, reason: err.message };
    }
    // Unexpected SDK failure: fall back to the dependency-free check.
    return verifyWassistSignatureHmac(rawBody, signatureHeader, secret);
  }
}

export function isInboundMessageEvent(event: string | undefined): boolean {
  return Boolean(event && INBOUND_MESSAGE_EVENTS.has(event));
}

// ---------------------------------------------------------------------------
// Outbound: POST https://backend.wassist.app/api/v1/conversations/{id}/messages/
// Header X-API-Key. Shapes per docs.wassist.app/api-reference/conversations/messages/send
//   { "type": "text",    "text":    { "body": "..." } }
//   { "type": "unified", "unified": { "text": "...", "footer": "...",
//                                     "media": { "url": "https://..." },
//                                     "buttons": [{ "type": "url", "text": "...", "url": "https://..." }] } }
// There is no `type: "image"`; pictures go through `unified.media.url`.
// Limits: text 1024, footer 60, button text 20, up to 3 buttons of one type.
// ---------------------------------------------------------------------------

export type WassistSendResult = {
  ok: boolean;
  status: number;
  error?: string;
  /** Which shape was actually sent (after any fallback). */
  shape?: "text" | "unified";
};

type WassistSendInput =
  | { type: "text"; text: { body: string } }
  | {
      type: "unified";
      unified: {
        text?: string;
        footer?: string;
        media?: { url: string };
        buttons?: Array<{ type: "url"; text: string; url: string }>;
      };
    };

async function sendWassistMessage(
  conversationId: string,
  input: WassistSendInput,
): Promise<WassistSendResult> {
  const apiKey = getWassistApiKey();
  if (!apiKey) {
    return { ok: false, status: 0, error: "WASSIST_API_KEY not set" };
  }

  const url = `${WASSIST_API_BASE}/conversations/${encodeURIComponent(conversationId)}/messages/`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        status: res.status,
        error: detail.slice(0, 200) || res.statusText,
        shape: input.type,
      };
    }
    return { ok: true, status: res.status, shape: input.type };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : "send failed",
      shape: input.type,
    };
  }
}

/** Send a plain text reply. Never log the key. */
export function sendWassistText(
  conversationId: string,
  body: string,
): Promise<WassistSendResult> {
  return sendWassistMessage(conversationId, {
    type: "text",
    text: { body: body.slice(0, 1024) },
  });
}

export type WassistUnifiedInput = {
  /** Caption / body, max 1024. */
  text: string;
  /** Absolute https URL to the picture. */
  mediaUrl?: string;
  /** Max 60 chars. */
  footer?: string;
  /** URL button; label max 20 chars. */
  button?: { text: string; url: string };
};

/**
 * Send a picture with caption and an optional link button. If Wassist rejects
 * the unified shape (4xx other than 404/401/403), fall back to a text message
 * that carries the same content plus the raw URLs.
 */
export async function sendWassistUnified(
  conversationId: string,
  input: WassistUnifiedInput,
): Promise<WassistSendResult> {
  const unified: Extract<WassistSendInput, { type: "unified" }>["unified"] = {
    text: input.text.slice(0, 1024),
  };
  if (input.footer) unified.footer = input.footer.slice(0, 60);
  if (input.mediaUrl && /^https:\/\//i.test(input.mediaUrl)) {
    unified.media = { url: input.mediaUrl };
  }
  if (input.button && /^https?:\/\//i.test(input.button.url)) {
    unified.buttons = [
      { type: "url", text: input.button.text.slice(0, 20), url: input.button.url },
    ];
  }

  const first = await sendWassistMessage(conversationId, { type: "unified", unified });
  if (first.ok) return first;

  // Auth / missing conversation: a text retry will fail the same way.
  if ([401, 403, 404].includes(first.status)) return first;
  if (first.status === 0 || first.status >= 500) return first;

  console.warn(
    `[wassist] unified send rejected (${first.status}); falling back to text`,
  );
  const lines = [input.text];
  if (input.mediaUrl) lines.push(input.mediaUrl);
  if (input.button?.url) lines.push(input.button.url);
  return sendWassistText(conversationId, lines.join("\n"));
}
