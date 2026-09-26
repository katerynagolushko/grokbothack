import { NextRequest, NextResponse } from "next/server";
import {
  buildJourney,
  closingLine,
  formatJourneyReplies,
  openerLine,
} from "@/lib/journey";
import { productImageSrc } from "@/lib/products";

export const runtime = "nodejs";

function hostBase(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

/** Same journey API the home chat box and WhatsApp use. */
export async function POST(req: NextRequest) {
  const base = hostBase(req);
  let want = "";
  try {
    const body = (await req.json()) as { text?: string };
    want = body.text ?? "";
  } catch {
    return NextResponse.json({ error: "Expected JSON { text }" }, { status: 400 });
  }

  const stops = await buildJourney(want, undefined, base);
  const replies = formatJourneyReplies(want, stops);

  return NextResponse.json({
    opener: openerLine(want, stops),
    closing: closingLine(stops),
    stops: stops.map((s) => ({
      id: s.product.id,
      store: s.product.store,
      source: s.product.source ?? "catalogue",
      title: s.product.title,
      priceGbp: s.product.priceGbp,
      fabric: s.product.fabric,
      kind: s.verdict.kind,
      because: s.verdict.because,
      href: s.href,
      imageUrl: s.imageUrl ?? s.product.imageUrl ?? productImageSrc(s.product),
      sourceUrl: s.product.sourceUrl,
    })),
    replies,
  });
}
