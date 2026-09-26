import type { Product, VerdictKind } from "./types";
import { judgeProduct } from "./verdict";
import {
  deriveSignalFacts,
  toLegacyShopper,
  type ShopperProfile,
  type Signal,
} from "./profiles";

/**
 * Rank one store's products for one shopper. Pure and deterministic.
 * Base verdict comes from lib/verdict.ts (fabric, budget, size, aesthetic);
 * cross-store history then moves items up or down and writes the reason.
 * Bad takes are never hidden: they rank last and carry a badge.
 */

export type RankedProduct = {
  id: string;
  rank: number;
  verdict: VerdictKind;
  score: number;
  reason: string;
  /** False when the store's size is not the shopper's size. */
  sizeOk: boolean;
  /** True when the reason cites cross-store history. */
  fromHistory: boolean;
  product: Product;
};

type BudgetGroup = "top" | "bottom" | "outer" | "dress";

const GROUP_BY_GARMENT: Record<string, BudgetGroup> = {
  blazer: "outer",
  jacket: "outer",
  coat: "outer",
  trousers: "bottom",
  jeans: "bottom",
  skirt: "bottom",
  dress: "dress",
  tee: "top",
  shirt: "top",
  hoodie: "top",
  sweat: "top",
  top: "top",
  knit: "top",
  cardigan: "top",
};

const GARMENT_PATTERNS: [RegExp, string][] = [
  [/blazer/, "blazer"],
  [/\bcoat\b|overcoat|trench/, "coat"],
  [/jacket|bomber|puffer/, "jacket"],
  [/trouser|pants|cargo|chino|slacks/, "trousers"],
  [/jeans|denim/, "jeans"],
  [/skirt/, "skirt"],
  [/dress/, "dress"],
  [/\btee\b|t-shirt|tshirt/, "tee"],
  [/shirt|blouse/, "shirt"],
  [/hoodie/, "hoodie"],
  [/sweat/, "sweat"],
  [/knit|crew|jumper|sweater/, "knit"],
  [/cardigan/, "cardigan"],
  [/\btop\b|cami/, "top"],
];

export function garmentOf(product: Product): string {
  if (product.category) return product.category;
  const t = product.title.toLowerCase();
  for (const [re, kind] of GARMENT_PATTERNS) if (re.test(t)) return kind;
  return "top";
}

export function budgetGroupOf(product: Product): BudgetGroup {
  return GROUP_BY_GARMENT[garmentOf(product)] ?? "top";
}

const NAMED_HEX: [string, [number, number, number]][] = [
  ["black", [26, 26, 26]],
  ["navy", [30, 42, 68]],
  ["grey", [128, 128, 128]],
  ["grey", [107, 124, 133]],
  ["white", [245, 245, 245]],
  ["cream", [240, 230, 216]],
  ["beige", [196, 183, 166]],
  ["brown", [92, 74, 58]],
  ["burgundy", [139, 41, 66]],
  ["red", [193, 39, 45]],
  ["green", [30, 77, 58]],
  ["yellow", [201, 162, 39]],
  ["blue", [74, 85, 96]],
];

const COLOUR_WORDS = [
  "black", "navy", "grey", "gray", "white", "cream", "ivory", "beige", "camel",
  "brown", "burgundy", "red", "green", "yellow", "gold", "blue", "pink",
];

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Plain colour word for a product: colourName, then title, then nearest swatch. */
export function colourOf(product: Product): string {
  if (product.colourName) return product.colourName.toLowerCase().split(/[\s,/]+/)[0];
  const t = product.title.toLowerCase();
  for (const w of COLOUR_WORDS) {
    if (new RegExp(`\\b${w}\\b`).test(t)) {
      if (w === "gray") return "grey";
      if (w === "ivory") return "cream";
      if (w === "camel") return "beige";
      if (w === "gold") return "yellow";
      return w;
    }
  }
  const rgb = hexToRgb(product.colour);
  if (!rgb) return "unknown";
  let best = "unknown";
  let bestD = Infinity;
  for (const [name, [r, g, b]] of NAMED_HEX) {
    const d = (rgb[0] - r) ** 2 + (rgb[1] - g) ** 2 + (rgb[2] - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

/** Fit words present on a product: wide-leg, fitted, oversized, logo, track, structured. */
export function fitsOf(product: Product): string[] {
  const text = `${product.title} ${product.aesthetic.join(" ")}`.toLowerCase();
  const fits: string[] = [];
  if (/wide|high-waist|palazzo|barrel/.test(text) && /trouser|pants|leg|jeans/.test(text)) {
    fits.push("wide-leg");
  }
  if (/fitted|slim|cigarette|column|bodycon|slip/.test(text)) fits.push("fitted");
  if (/oversized|boxy|relaxed|shift/.test(text)) fits.push("oversized");
  if (/logo|graphic/.test(text)) fits.push("logo");
  if (/track|sporty/.test(text)) fits.push("track");
  if (/structured|tailored|crop blazer/.test(text)) fits.push("structured");
  return fits;
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh"];
function ordinal(n: number): string {
  return ORDINALS[n - 1] ?? `${n}th`;
}

type Scored = {
  score: number;
  verdict: VerdictKind;
  reason: string;
  sizeOk: boolean;
  fromHistory: boolean;
};

function scoreProduct(
  product: Product,
  profile: ShopperProfile,
  signals: Signal[],
): Scored {
  const group = budgetGroupOf(product);
  const band = profile.budget[group] ?? profile.budget.top ?? [0, Infinity];
  // Size is judged here, not in verdict.ts: wrong size greys the tile but
  // taste still decides where it sits, so a store sees what would have sold.
  const legacy = { ...toLegacyShopper(profile, band[1]), size: product.size };
  const base = judgeProduct(product, legacy);
  const sizeOk = product.size === profile.sizes.bottom;
  const colour = colourOf(product);
  const fits = fitsOf(product);
  const fabric = product.fabric.toLowerCase();
  const garment = garmentOf(product);

  const fitSignal = (key: string) => signals.find((s) => s.key === key);

  // —— Hard fails from verdict.ts. Never hidden, always last. ——
  if (base.fails.includes("dealbreaker_fabric")) {
    const noteKey = profile.dealbreakerFabrics.find((f) => fabric.includes(f));
    const note = noteKey ? profile.fabricNotes?.[noteKey] : undefined;
    const sig = fitSignal(noteKey ?? "");
    return {
      score: -10,
      verdict: "bad",
      reason: note
        ? `${cap(product.fabric)}. You said ${note.toLowerCase().replace(/\.$/, "")}.`
        : base.because,
      sizeOk,
      fromHistory: Boolean(sig),
    };
  }
  if (base.fails.includes("over_budget")) {
    return {
      score: -8,
      verdict: "bad",
      reason: `£${product.priceGbp}. Your ${group} band stops at £${band[1]}.`,
      sizeOk,
      fromHistory: false,
    };
  }

  // Returned-fit repeat: e.g. Bea returned an oversized shirt as too boxy.
  const avoidFit = fits.find((f) => fitSignal(f)?.strength === "avoid" && fitSignal(f)?.kind === "return");
  if (avoidFit) {
    const sig = fitSignal(avoidFit) as Signal;
    return {
      score: -7,
      verdict: "bad",
      reason: `${cap(avoidFit === "oversized" ? "boxy" : avoidFit)}. You ${sig.aside}.`,
      sizeOk,
      fromHistory: true,
    };
  }

  // Hated motifs (logo for Alex) unless the shopper actively likes them.
  const likes = (profile.likes ?? []).map((l) => l.toLowerCase());
  const hatedMotif = fits.find(
    (f) => profile.hates.some((h) => f.includes(h.toLowerCase())) && !likes.includes(f),
  );
  if (base.kind === "bad" || hatedMotif) {
    return {
      score: -6,
      verdict: "bad",
      reason: hatedMotif === "logo" ? "A logo. How original." : base.because,
      sizeOk,
      fromHistory: false,
    };
  }

  // —— Soft scoring. ——
  let score = base.kind === "suggest" ? 3 : 0;
  let reason: string | null = null;
  let fromHistory = false;

  const shopperAes = new Set(profile.aesthetic.map((a) => a.toLowerCase()));
  const overlap = product.aesthetic.filter((a) => shopperAes.has(a.toLowerCase()));
  score += overlap.length;

  // History-backed fits: strong repeat buys move it up and write the line.
  const strongFit = fits.find((f) => fitSignal(f)?.strength === "strong" && fitSignal(f)?.kind === "fit");
  if (strongFit) {
    const sig = fitSignal(strongFit) as Signal;
    const n = parseInt(sig.aside, 10) || 2;
    score += 4;
    fromHistory = true;
    reason =
      strongFit === "wide-leg"
        ? `${ordinal(n + 1)} wide-leg. You know why.`
        : `${cap(strongFit)}. ${cap(sig.aside)}. Keep going.`;
  } else {
    const noteFit = fits.find((f) => fitSignal(f)?.strength === "note" && fitSignal(f)?.kind === "fit" && likes.includes(f));
    if (noteFit) {
      const sig = fitSignal(noteFit) as Signal;
      score += 3;
      fromHistory = true;
      reason = `${cap(noteFit)}. Your ${sig.aside.replace(/^your /, "")} has company.`;
    }
  }

  // Colour: liked lifts, avoided caps at meh.
  const liked = profile.coloursLiked.includes(colour);
  const avoided = profile.coloursAvoided.includes(colour);
  if (liked) {
    score += 2;
    if (!reason) {
      const colSig = signals.find((s) => s.kind === "colour" && s.key === colour);
      if (colSig) {
        fromHistory = true;
        reason = `${cap(colour)}. ${cap(colSig.aside)}. Consistent.`;
      }
    }
  }
  if (avoided) {
    score = Math.min(score - 3, 2);
    reason = `${cap(colour)}. You don't do ${colour}.`;
  }

  // Sleeve note on outerwear for a shopper who returned for short sleeves.
  const sleeve = signals.find((s) => s.key === "sleeve");
  if (sleeve && (garment === "jacket" || garment === "blazer" || garment === "coat")) {
    fromHistory = true;
    reason = reason ?? `Check the sleeves. You ${sleeve.aside}.`;
  }

  // Liked fits from the profile itself (not history) give a nudge.
  if (fits.some((f) => profile.fits.includes(f))) score += 1;

  // Wrong size: greyed on the tile, nudged down, taste line kept.
  if (!sizeOk) score -= 2;

  const verdict: VerdictKind = score >= 4 ? "suggest" : score <= -3 ? "bad" : "meh";

  if (!reason) {
    if (verdict === "suggest") {
      reason = base.kind === "suggest"
        ? base.because
        : `${cap(overlap[0] ?? colour)}. Wear it.`;
    } else if (verdict === "bad") {
      reason = "No.";
    } else {
      reason = liked
        ? `${cap(colour)}, at least. The rest is noise.`
        : "Wrong idea. Entirely.";
    }
  }

  return { score, verdict, reason, sizeOk, fromHistory };
}

const VERDICT_ORDER: Record<VerdictKind, number> = { suggest: 0, meh: 1, bad: 2 };

export function rankForShopper(
  profile: ShopperProfile,
  products: Product[],
  storeId?: string,
): RankedProduct[] {
  const pool = storeId ? products.filter((p) => p.store === storeId) : products;
  const signals = deriveSignalFacts(profile);
  const scored = pool.map((product) => ({ product, ...scoreProduct(product, profile, signals) }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (VERDICT_ORDER[a.verdict] !== VERDICT_ORDER[b.verdict]) {
      return VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict];
    }
    if (a.product.priceGbp !== b.product.priceGbp) return a.product.priceGbp - b.product.priceGbp;
    return a.product.id.localeCompare(b.product.id);
  });
  return scored.map((s, i) => ({
    id: s.product.id,
    rank: i + 1,
    verdict: s.verdict,
    score: s.score,
    reason: s.reason,
    sizeOk: s.sizeOk,
    fromHistory: s.fromHistory,
    product: s.product,
  }));
}

export function rankCounts(ranked: RankedProduct[]) {
  let suggest = 0;
  let meh = 0;
  let bad = 0;
  for (const r of ranked) {
    if (r.verdict === "suggest") suggest += 1;
    else if (r.verdict === "meh") meh += 1;
    else bad += 1;
  }
  return { suggest, meh, bad };
}
