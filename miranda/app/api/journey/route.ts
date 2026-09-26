import { NextRequest, NextResponse } from "next/server";
import {
  buildJourney,
  closingLine,
  formatJourneyReplies,
  openerLine,
  polishStops,
} from "@/lib/journey";
import { isDemoBlazerQuery } from "@/lib/demoCatalogue";
import { currentModel, llmAvailable } from "@/lib/llm";
import { productImageSrc } from "@/lib/products";

export const runtime = "nodejs";
export const maxDuration = 30;

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

  const stops = await polishStops(await buildJourney(want, undefined, base)).catch(() => []);
  const replies = formatJourneyReplies(want, stops);

  let web:
    | {
        providers: string[];
        openaiHits: number;
        model: string | null;
        pagesFetched?: number;
        imagesKept?: number;
      }
    | undefined;
  if (!isDemoBlazerQuery(want)) {
    try {
      const { lastWebSearchMeta } = await import("@/lib/webImages");
      web = lastWebSearchMeta();
    } catch {
      web = undefined;
    }
  }

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
      colour: s.product.colour,
      sourceUrl: s.product.sourceUrl,
    })),
    replies,
    meta: {
      lockedBlazer: isDemoBlazerQuery(want),
      llm: llmAvailable() ? currentModel() : null,
      web,
    },
  });
}
