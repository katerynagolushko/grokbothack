import type { JourneyStop, Product, VerdictKind } from "./types";

type Row = { stops: JourneyStop[]; at: number };

/** Warm-instance memory for WhatsApp and a follow-up POST /api/journey. */
const rows = new Map<string, Row>();
const TTL_MS = 45 * 60 * 1000;

export function rememberStops(key: string, stops: JourneyStop[]): void {
  if (!key || stops.length === 0) return;
  rows.set(key, { stops, at: Date.now() });
}

export function recallStops(key: string): JourneyStop[] {
  const row = rows.get(key);
  if (!row) return [];
  if (Date.now() - row.at > TTL_MS) {
    rows.delete(key);
    return [];
  }
  return row.stops;
}

/** Client may resend the cards it is showing. Invalid rows are dropped. */
export function stopsFromClient(raw: unknown): JourneyStop[] {
  if (!Array.isArray(raw)) return [];
  const out: JourneyStop[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const title = typeof s.title === "string" ? s.title : "";
    const href =
      typeof s.href === "string"
        ? s.href
        : typeof s.sourceUrl === "string"
          ? s.sourceUrl
          : "";
    if (!title || !href) continue;
    const id = typeof s.id === "string" && s.id ? s.id : href;
    const kind: VerdictKind =
      s.kind === "bad" || s.kind === "meh" || s.kind === "suggest" ? s.kind : "suggest";
    const imageUrl = typeof s.imageUrl === "string" ? s.imageUrl : undefined;
    const store: Product["store"] =
      s.store === "runway" || s.store === "archive" || s.store === "web" ? s.store : "web";
    out.push({
      href,
      imageUrl,
      product: {
        id,
        store,
        title,
        priceGbp: typeof s.priceGbp === "number" ? s.priceGbp : 0,
        fabric: typeof s.fabric === "string" ? s.fabric : "unlisted",
        size: "8",
        aesthetic: [],
        colour: typeof s.colour === "string" ? s.colour : "#333",
        sellerPitch: "",
        imageUrl,
        source: store === "web" ? "web" : "catalogue",
        sourceUrl: typeof s.sourceUrl === "string" ? s.sourceUrl : href,
      },
      verdict: {
        kind,
        fails: [],
        passes: [],
        because: typeof s.because === "string" && s.because ? s.because : "Wear it.",
      },
    });
  }
  return out;
}
