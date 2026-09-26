import { NextRequest, NextResponse } from "next/server";
import {
  buildJourney,
  closingLine,
  formatJourneyReplies,
  openerLine,
  polishStops,
} from "@/lib/journey";
import { recallStops, rememberStops, stopsFromClient } from "@/lib/lastStops";
import { applyPick } from "@/lib/pick";
import { isDemoBlazerQuery } from "@/lib/demoCatalogue";
import { currentModel, llmAvailable } from "@/lib/llm";
import { productImageSrc } from "@/lib/products";
import type { JourneyStop } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

function hostBase(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

const WEB_SESSION = "web";

function journeyJson(
  want: string,
  stops: JourneyStop[],
  voice?: { opener: string; closing: string | null },
  picked?: number,
) {
  const opener = voice?.opener ?? openerLine(want, stops);
  const closing = voice ? voice.closing : closingLine(stops);
  const replies = formatJourneyReplies(want, stops, voice);
  return {
    opener,
    closing,
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
      picked: picked ?? null,
    },
  };
}

/** Same journey API the home chat box and WhatsApp use. */
export async function POST(req: NextRequest) {
  const base = hostBase(req);
  let want = "";
  let clientStops: JourneyStop[] = [];
  try {
    const body = (await req.json()) as { text?: string; lastStops?: unknown };
    want = body.text ?? "";
    clientStops = stopsFromClient(body.lastStops);
  } catch {
    return NextResponse.json({ error: "Expected JSON { text }" }, { status: 400 });
  }

  const prior = clientStops.length > 0 ? clientStops : recallStops(WEB_SESSION);
  const picked = applyPick(want, prior);
  if (picked) {
    return NextResponse.json(
      journeyJson(
        want,
        picked.stops,
        { opener: picked.opener, closing: null },
        picked.index,
      ),
    );
  }

  const stops = await polishStops(await buildJourney(want, undefined, base)).catch(() => []);
  if (stops.length > 0) rememberStops(WEB_SESSION, stops);

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

  const payload = journeyJson(want, stops);
  return NextResponse.json({ ...payload, meta: { ...payload.meta, web } });
}
