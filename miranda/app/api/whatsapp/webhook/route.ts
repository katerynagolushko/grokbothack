import { NextRequest, NextResponse } from "next/server";
import {
  buildJourney,
  flattenRepliesForText,
  formatJourneyReplies,
} from "@/lib/journey";

export const runtime = "nodejs";

function hostBase(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

function isTwilioForm(contentType: string | null): boolean {
  return Boolean(contentType?.includes("application/x-www-form-urlencoded"));
}

function twiml(messages: string[]): Response {
  const body = messages
    .map((m) => `<Message>${escapeXml(m)}</Message>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Health / Meta-style verify stub. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: true, service: "miranda-whatsapp-webhook" });
}

/**
 * Provider-agnostic webhook.
 * JSON: { from, text } → { replies: MirandaReply[], from }
 * Twilio form: Body, From → TwiML <Message> with text + image URL + product URL lines.
 *
 * Auth / account login is stubbed for the friend's WhatsApp setup later.
 * TWILIO_AUTH_TOKEN is reserved; signature check not enforced in this slice.
 */
export async function POST(req: NextRequest) {
  const base = hostBase(req);
  const contentType = req.headers.get("content-type");

  let from = "unknown";
  let text = "";

  if (isTwilioForm(contentType)) {
    const form = await req.formData();
    from = String(form.get("From") ?? "unknown");
    text = String(form.get("Body") ?? "");
  } else {
    try {
      const body = (await req.json()) as { from?: string; text?: string };
      from = body.from ?? "unknown";
      text = body.text ?? "";
    } catch {
      return NextResponse.json(
        { error: "Expected JSON { from, text } or Twilio form Body/From" },
        { status: 400 },
      );
    }
  }

  void from; // reserved for per-shopper profiles later
  const stops = await buildJourney(text, undefined, base);
  const replies = formatJourneyReplies(text, stops);

  if (isTwilioForm(contentType)) {
    const flat = flattenRepliesForText(replies);
    // Twilio prefers fewer longer messages; join into 1–2 chunks
    const chunks: string[] = [];
    let buf = "";
    for (const line of flat) {
      const next = buf ? `${buf}\n\n${line}` : line;
      if (next.length > 1400) {
        if (buf) chunks.push(buf);
        buf = line;
      } else {
        buf = next;
      }
    }
    if (buf) chunks.push(buf);
    return twiml(chunks.length ? chunks : flat);
  }

  return NextResponse.json({ replies, from });
}
