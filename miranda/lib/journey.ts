import {
  DEMO_BLAZERS,
  DEMO_BLAZER_IDS,
  DEMO_REFUSE,
  isDemoBlazerQuery,
} from "./demoCatalogue";

export const NOTHING_WORTH = "Nothing worth your time.";
export const STATE_NEED = "State what you need.";
import { garmentWord, looksLikeClothingAsk, parseIntent, type QueryIntent } from "./intent";
import { llmAvailable, mirandaSay, parseIntentLLM } from "./llm";
import { productImageSrc, productPath } from "./products";
import { getProfile, signalStrip } from "./profiles";
import { DEMO_SHOPPER } from "./shopper";
import type {
  JourneyStop,
  MirandaReply,
  Product,
  ShopperProfile,
  Verdict,
} from "./types";

function absoluteUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function capitaliseWord(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * WhatsApp / home-chat search results are links to present, not in-house SKUs
 * to fail. Never run polyester / budget / size bad-take here — that stays on
 * shop pages via judgeProduct. Cold descriptive one-liner only (never a skip).
 */
function recommendLine(product: Product): string {
  // Locked demo blazers: distinct lines, never a rejection.
  const locked: Record<string, string> = {
    "asos-blazer": "Black. Relaxed. Wear it.",
    "wilson-charlotte": "Black. Structured.",
    "nobodys-child-blazer": "Double-breasted. Wear it.",
    "mango-blazer": "Fitted. Black.",
  };
  if (locked[product.id]) return locked[product.id];

  const colour = product.colourName ? capitaliseWord(product.colourName) : null;
  const preferred = [
    "structured",
    "sharp",
    "minimal",
    "monochrome",
    "heritage",
    "tailored",
    "fitted",
  ];
  const raw =
    preferred.find((p) =>
      product.aesthetic.some((a) => a.toLowerCase() === p),
    ) ?? product.aesthetic[0];
  const tag = raw ? capitaliseWord(raw) : null;
  const title = product.title.toLowerCase();
  if (/\bdouble[- ]?breasted\b/.test(title)) return "Double-breasted. Wear it.";
  if (/\bfitted\b/.test(title)) return colour ? `Fitted. ${colour}.` : "Fitted. Wear it.";
  if (/\brelaxed\b/.test(title)) return colour ? `${colour}. Relaxed.` : "Relaxed. Wear it.";
  const variants = [
    colour && tag ? `${colour}. ${tag}.` : null,
    colour && tag ? `${colour}. ${tag}. Wear it.` : null,
    tag ? `${tag}. Wear it.` : null,
    colour ? `${colour}. Wear it.` : null,
    colour ? `${colour}. Obvious.` : null,
    tag ? `${tag}.` : null,
  ].filter((v): v is string => Boolean(v));
  if (variants.length === 0) return "Wear it.";
  const n = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0) % variants.length;
  return variants[n] ?? "Wear it.";
}

function recommendVerdict(product: Product): Verdict {
  return {
    kind: "suggest",
    fails: [],
    passes: [],
    because: recommendLine(product),
  };
}

function toStop(product: Product, baseUrl: string): JourneyStop {
  const href = product.sourceUrl ?? `${baseUrl}${productPath(product, true)}`;
  const img = product.imageUrl ?? productImageSrc(product);
  return {
    product,
    verdict: recommendVerdict(product),
    href,
    imageUrl: img ? absoluteUrl(baseUrl, img) : undefined,
  };
}

/** Normalise a product / stop URL for equality (trailing slash, case). */
function urlKey(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const t = url.trim().toLowerCase().replace(/\/+$/, "");
  return t || undefined;
}

/**
 * Keep each product / link once. First wins. Used before WhatsApp send and in
 * journey builders so a web search repeat never becomes two cards.
 */
export function dedupeStops(stops: JourneyStop[]): JourneyStop[] {
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const out: JourneyStop[] = [];
  for (const stop of stops) {
    const id = stop.product.id;
    if (seenIds.has(id)) continue;
    const href = urlKey(stop.product.sourceUrl) ?? urlKey(stop.href);
    if (href && seenUrls.has(href)) continue;
    seenIds.add(id);
    if (href) seenUrls.add(href);
    out.push(stop);
  }
  return out;
}

/** Locked four-blazer journey. No old catalogue. No Openverse / Pexels. */
function buildLockedJourney(
  want: string,
  _shopper: ShopperProfile,
  baseUrl: string,
): JourneyStop[] {
  if (!isDemoBlazerQuery(want)) return [];
  return dedupeStops(DEMO_BLAZERS.map((product) => toStop(product, baseUrl)));
}

const RESOLVED = new Map<string, QueryIntent>();

export async function resolveIntent(want: string): Promise<QueryIntent> {
  const intent = parseIntent(want);
  if (intent.garments.length > 0 || !llmAvailable() || !want.trim()) return intent;
  const llm = await parseIntentLLM(want);
  if (!llm) return intent;
  const garments = llm.garment ? [llm.garment] : (llm.garmentCandidates ?? []).slice(0, 2);
  const merged: QueryIntent = {
    garments,
    colours: intent.colours.length ? intent.colours : (llm.colours ?? []),
    fabrics: intent.fabrics,
    maxBudgetGbp: intent.maxBudgetGbp ?? llm.budgetMax ?? null,
  };
  if (RESOLVED.size > 200) RESOLVED.clear();
  RESOLVED.set(want.trim().toLowerCase(), merged);
  return merged;
}

/** Locked demo lines stay as written. No model rewrite of search results. */
export async function polishStops(
  stops: JourneyStop[],
  shopper: ShopperProfile = DEMO_SHOPPER,
): Promise<JourneyStop[]> {
  // Journey stops are recommendations (links), not bad-take judgements.
  // Never let the model invent a skip line for web / demo search cards.
  if (stops.every((s) => s.verdict.kind === "suggest")) return stops;
  if (stops.some((s) => DEMO_BLAZER_IDS.has(s.product.id))) return stops;
  if (!llmAvailable() || stops.length === 0) return stops;
  const signals = signalStrip(getProfile(shopper.id));
  const targets = stops.filter((s) => s.product.source !== "web").slice(0, 3);
  const lines = await Promise.all(
    targets.map((s) =>
      mirandaSay({
        verdict: s.verdict,
        title: s.product.title,
        priceGbp: s.product.priceGbp,
        fabric: s.product.fabric,
        store: s.product.store,
        shopperName: shopper.name,
        signals,
      }).catch(() => null),
    ),
  );
  targets.forEach((s, i) => {
    if (lines[i]) s.verdict = { ...s.verdict, because: lines[i] as string };
  });
  return stops;
}

export async function buildJourney(
  want: string,
  shopper: ShopperProfile = DEMO_SHOPPER,
  baseUrl = "",
): Promise<JourneyStop[]> {
  try {
    if (isDemoBlazerQuery(want)) {
      return buildLockedJourney(want, shopper, baseUrl);
    }
    const intent = await resolveIntent(want);
    if (intent.garments.length === 0) {
      // Soft clothing ask without a family → still never say "nothing".
      if (looksLikeClothingAsk(want)) {
        const fallback: QueryIntent = {
          ...intent,
          garments: ["top"],
        };
        const { buildLocalShopProducts } = await import("./webImages");
        return dedupeStops(
          buildLocalShopProducts(fallback, 3).map((product) =>
            toStop(product, baseUrl),
          ),
        );
      }
      return [];
    }
    const { searchWebProducts, buildLocalShopProducts } = await import("./webImages");
    let products = await searchWebProducts(intent, 3).catch(() => [] as Product[]);
    // Network / enrich must never wipe clothing cards.
    if (products.length === 0) {
      products = buildLocalShopProducts(intent, 3);
    }
    return dedupeStops(products.map((product) => toStop(product, baseUrl)));
  } catch {
    try {
      const intent = parseIntent(want);
      if (intent.garments.length > 0 || looksLikeClothingAsk(want)) {
        const { buildLocalShopProducts } = await import("./webImages");
        const safe: QueryIntent =
          intent.garments.length > 0 ? intent : { ...intent, garments: ["top"] };
        return dedupeStops(
          buildLocalShopProducts(safe, 3).map((product) =>
            toStop(product, baseUrl),
          ),
        );
      }
    } catch {
      /* fall through */
    }
    return [];
  }
}

/** Same locked catalogue. Client fallback. No network. */
export function buildCatalogueJourney(
  want: string,
  shopper: ShopperProfile = DEMO_SHOPPER,
  baseUrl = "",
): JourneyStop[] {
  return buildLockedJourney(want, shopper, baseUrl);
}

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

/** Locked demo opener. Clothes always get cards. Small talk: nothing. */
export function openerLine(want: string, stops: JourneyStop[]): string {
  const n = stops.length;
  if (isDemoBlazerQuery(want)) {
    if (n === 4) return "Four. Don't browse.";
    if (n === 0) return DEMO_REFUSE;
  } else if (n === 0) {
    // Clothing asks must never hit this path; still refuse the empty line if they do.
    if (looksLikeClothingAsk(want)) return STATE_NEED;
    return NOTHING_WORTH;
  }
  const intent = RESOLVED.get(want.trim().toLowerCase()) ?? parseIntent(want);
  const label = garmentLabel(intent);
  if (intent.garments.length && n < 3) {
    return n === 1
      ? `One ${label}. Thin. Don't invent.`
      : `${countWord(n)}. Thin. Look.`;
  }
  return `${countWord(n)}. Don't browse.`;
}

export function closingLine(stops: JourneyStop[]): string | null {
  const n = stops.length;
  if (n === 0) return null;
  const good = stops.filter((s) => s.verdict.kind === "suggest").length;
  const bad = stops.filter((s) => s.verdict.kind === "bad").length;
  if (n === 1) {
    return good
      ? "Done. That. Or nothing."
      : bad
        ? "Done. No."
        : "Done. If you insist.";
  }
  if (bad === 0) return `Done. ${countWord(good)}. Decide.`;
  return `Done. ${countWord(good)}. Discard the rest.`;
}

export function formatJourneyReplies(
  want: string,
  stops: JourneyStop[],
): MirandaReply[] {
  const replies: MirandaReply[] = [];
  replies.push({ kind: "plan", text: openerLine(want, stops) });
  if (stops.length === 0) return replies;

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
