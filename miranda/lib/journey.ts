import {
  colourMatchScore,
  garmentWord,
  intentScore,
  matchesColourIntent,
  matchesGarmentIntent,
  parseIntent,
  type QueryIntent,
} from "./intent";
import { PRODUCTS, productImageSrc, productPath } from "./products";
import { DEMO_SHOPPER } from "./shopper";
import type {
  JourneyStop,
  MirandaReply,
  Product,
  ShopperProfile,
  Verdict,
} from "./types";
import { judgeProduct } from "./verdict";
import { searchWebProducts } from "./webImages";

/** Below this many in-family, on-colour catalogue hits we go to the wider web. */
const MIN_CATALOGUE_MATCHES = 2;
const MAX_STOPS = 5;
const MAX_WEB_STOPS = 3;

function absoluteUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

type Judged = {
  product: Product;
  verdict: Verdict;
  queryScore: number;
  colourScore: number;
};

function rankJudged(a: Judged, b: Judged): number {
  // Garment/colour/budget intent first
  if (b.queryScore !== a.queryScore) return b.queryScore - a.queryScore;
  if (b.colourScore !== a.colourScore) return b.colourScore - a.colourScore;
  // Our own shops before the wider web
  const src = (p: Product) => (p.source === "web" ? 1 : 0);
  if (src(a.product) !== src(b.product)) return src(a.product) - src(b.product);
  const rank = (k: string) => (k === "suggest" ? 0 : k === "meh" ? 1 : 2);
  const d = rank(a.verdict.kind) - rank(b.verdict.kind);
  if (d !== 0) return d;
  return a.product.priceGbp - b.product.priceGbp;
}

/** Miranda is honest about web finds: not her shops, fabric unverified. */
function webVerdict(product: Product, shopper: ShopperProfile): Verdict {
  const v = judgeProduct(product, shopper);
  const fabricLine =
    product.fabric === "unlisted"
      ? "Fabric unlisted. Ask before you pay."
      : `Says ${product.fabric}. Check before you pay.`;
  if (v.kind === "bad") {
    return { ...v, because: `${v.because} Wider web, not my shops.` };
  }
  return {
    ...v,
    because: `Not my shops. Wider web. ${fabricLine}`,
  };
}

function judge(product: Product, shopper: ShopperProfile, intent: QueryIntent): Judged {
  const verdict =
    product.source === "web" ? webVerdict(product, shopper) : judgeProduct(product, shopper);
  return {
    product,
    verdict,
    queryScore: intentScore(product, intent),
    colourScore: colourMatchScore(product, intent),
  };
}

function toStop(j: Judged, baseUrl: string): JourneyStop {
  const { product, verdict } = j;
  const href =
    product.source === "web" && product.sourceUrl
      ? product.sourceUrl
      : `${baseUrl}${productPath(product, true)}`;
  const img = product.imageUrl ?? productImageSrc(product);
  return {
    product,
    verdict,
    href,
    imageUrl: img ? absoluteUrl(baseUrl, img) : undefined,
  };
}

function pickStops(judged: Judged[]): Judged[] {
  const ordered = [...judged].sort(rankJudged);

  // Prefer suggests, keep skips in-family so Miranda can trash a wrong fabric
  const suggests = ordered.filter((j) => j.verdict.kind === "suggest");
  const bads = ordered.filter((j) => j.verdict.kind === "bad");
  const mehs = ordered.filter((j) => j.verdict.kind === "meh");

  const picks: Judged[] = [];
  const seen = new Set<string>();
  const push = (j: Judged) => {
    if (seen.has(j.product.id) || picks.length >= MAX_STOPS) return;
    seen.add(j.product.id);
    picks.push(j);
  };

  for (const s of suggests.slice(0, 3)) push(s);
  for (const b of bads.slice(0, 2)) push(b);
  for (const m of mehs) push(m);
  for (const j of ordered) push(j);
  return picks;
}

/**
 * Build a short journey of stops.
 * Layer 1: curated catalogue, strict garment family, colour-ranked.
 * Layer 2: if fewer than MIN_CATALOGUE_MATCHES on-colour hits, add real photos
 * from the wider web (Pexels / Openverse / Wikimedia) as "web" products.
 * Never pads with unrelated garments.
 */
export async function buildJourney(
  want: string,
  shopper: ShopperProfile = DEMO_SHOPPER,
  baseUrl = "",
): Promise<JourneyStop[]> {
  const intent = parseIntent(want);
  const pool = PRODUCTS.filter((p) => matchesGarmentIntent(p, intent));

  const onColour = pool.filter((p) => matchesColourIntent(p, intent));
  let candidates: Product[] = intent.colours.length ? onColour : pool;

  if (intent.garments.length > 0 && onColour.length < MIN_CATALOGUE_MATCHES) {
    let web: Product[] = [];
    try {
      web = await searchWebProducts(intent, MAX_WEB_STOPS);
    } catch {
      web = [];
    }
    // Keep off-colour in-family items only if we found nothing on the web either
    candidates = onColour.length || web.length ? [...onColour, ...web] : pool;
  }

  const judged = candidates.map((p) => judge(p, shopper, intent));
  return pickStops(judged).map((j) => toStop(j, baseUrl));
}

/** Synchronous, catalogue-only variant (no network). Used by client fallbacks. */
export function buildCatalogueJourney(
  want: string,
  shopper: ShopperProfile = DEMO_SHOPPER,
  baseUrl = "",
): JourneyStop[] {
  const intent = parseIntent(want);
  const pool = PRODUCTS.filter((p) => matchesGarmentIntent(p, intent));
  const onColour = pool.filter((p) => matchesColourIntent(p, intent));
  const candidates = intent.colours.length && onColour.length ? onColour : pool;
  const judged = candidates.map((p) => judge(p, shopper, intent));
  return pickStops(judged).map((j) => toStop(j, baseUrl));
}

// ---------------------------------------------------------------------------
// Copy. Cold, short. Numbers are about THIS journey, never the whole catalogue.
// ---------------------------------------------------------------------------

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five"];

export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many;
}

function garmentLabel(intent: QueryIntent): string {
  if (intent.garments.length === 0) return "piece";
  return intent.garments.map(garmentWord).join(" / ");
}

/** "One stop." / "Two stops. Don't wander." */
export function openerLine(want: string, stops: JourneyStop[]): string {
  const intent = parseIntent(want);
  const n = stops.length;
  const label = garmentLabel(intent);
  const webCount = stops.filter((s) => s.product.source === "web").length;

  if (n === 0) {
    return intent.garments.length
      ? `No ${label} worth your time. Anywhere.`
      : "Nothing. Raise the brief.";
  }
  const stopsWord = `${countWord(n)} ${plural(n, "stop")}.`;
  if (webCount === n) {
    return `${stopsWord} None in my shops. Wider web. Look.`;
  }
  if (webCount > 0) {
    return `${stopsWord} ${countWord(n - webCount)} mine, ${countWord(webCount).toLowerCase()} from the wider web.`;
  }
  if (intent.garments.length && n < 3) {
    return n === 1
      ? `One ${label}. That's the catalogue. Don't invent.`
      : `${stopsWord} Thin pickings. Look.`;
  }
  return want.trim()
    ? `${stopsWord} Don't wander.`
    : `${stopsWord} You didn't specify. I did.`;
}

/** "Done. One worth it. One wasn't." — counts from this journey only. */
export function closingLine(stops: JourneyStop[]): string | null {
  const n = stops.length;
  if (n === 0) return null;
  const good = stops.filter((s) => s.verdict.kind === "suggest").length;
  const bad = stops.filter((s) => s.verdict.kind === "bad").length;
  if (n === 1) {
    return good ? "Done. That one. Or nothing." : bad ? "Done. Not that. Nothing else." : "Done. Fine, if you must.";
  }
  const parts = ["Done."];
  parts.push(`${countWord(good)} worth it.`);
  if (bad) parts.push(`${countWord(bad)} ${plural(bad, "wasn't", "weren't")}.`);
  if (bad) parts.push("The skips stay.");
  return parts.join(" ");
}

export function formatJourneyReplies(
  want: string,
  stops: JourneyStop[],
): MirandaReply[] {
  const replies: MirandaReply[] = [];
  const n = stops.length;

  replies.push({ kind: "plan", text: openerLine(want, stops) });
  if (n === 0) return replies;

  for (const stop of stops) {
    replies.push({
      kind: stop.verdict.kind,
      text: stop.verdict.because,
      link: stop.href,
      imageUrl: stop.imageUrl,
      productId: stop.product.id,
      title: stop.product.title,
      priceGbp: stop.product.priceGbp,
    });
  }

  const close = closingLine(stops);
  if (close) replies.push({ kind: "plan", text: close });
  return replies;
}

/** Flatten structured replies for TwiML / plain SMS (image URL + page URL on own lines). */
export function flattenRepliesForText(replies: MirandaReply[]): string[] {
  return replies.map((r) => {
    const parts = [r.text];
    if (r.title && r.priceGbp != null) {
      parts.unshift(`${r.title} — £${r.priceGbp}`);
    }
    if (r.imageUrl) parts.push(r.imageUrl);
    if (r.link) parts.push(r.link);
    return parts.join("\n");
  });
}
