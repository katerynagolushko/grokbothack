import type { ShopperProfile as LegacyShopper } from "./types";
import { DEMO_SHOPPER } from "./shopper";

/**
 * One portable shopper profile. WhatsApp is where Miranda learns it;
 * partner stores read a consented card through /api/profile and /api/rank.
 * Cross-store purchase history is the part no single store has.
 */

export type Purchase = {
  store: string;
  item: string;
  category: string;
  colour: string;
  /** ISO month or date, e.g. "2026-03". */
  date: string;
  price: number;
  returned?: boolean;
  returnReason?: string;
};

export type ShopperId = "alex" | "bea";

export type ShopperProfile = {
  id: ShopperId;
  name: string;
  sizes: { top: string; bottom: string; shoe?: string };
  /** Budget bands in £ by garment group: top, bottom, outer, dress. */
  budget: Record<string, [number, number]>;
  coloursLiked: string[];
  coloursAvoided: string[];
  fits: string[];
  aesthetic: string[];
  dealbreakerFabrics: string[];
  /** Why a fabric is out, in the shopper's words. Used in reason lines. */
  fabricNotes?: Record<string, string>;
  hates: string[];
  /** Things the shopper actively wants (e.g. logo tees for Bea). */
  likes?: string[];
  brandsLiked: string[];
  purchases: Purchase[];
  consents: Record<string, boolean>;
};

export const PROFILES: Record<ShopperId, ShopperProfile> = {
  alex: {
    id: "alex",
    name: "Alex",
    sizes: { top: "S", bottom: "8", shoe: "5" },
    budget: { top: [30, 80], bottom: [30, 90], outer: [60, 150], dress: [40, 100] },
    coloursLiked: ["black", "navy", "grey"],
    coloursAvoided: ["yellow", "red", "beige", "cream"],
    fits: ["tailored", "wide-leg", "structured"],
    aesthetic: ["minimal", "tailored", "structured", "monochrome", "sharp", "dark"],
    dealbreakerFabrics: ["polyester", "poly"],
    fabricNotes: { polyester: "no" },
    hates: ["logo", "logo tee", "graphic tee", "loud"],
    brandsLiked: ["COS", "Arket", "Fleek"],
    purchases: [
      { store: "COS", item: "Wide-leg trousers", category: "trousers", colour: "black", date: "2026-03", price: 79 },
      { store: "COS", item: "Wide-leg trousers", category: "trousers", colour: "black", date: "2026-05", price: 79 },
      { store: "COS", item: "Wide-leg trousers", category: "trousers", colour: "black", date: "2026-08", price: 85 },
      {
        store: "H&M",
        item: "Navy jacket",
        category: "jacket",
        colour: "navy",
        date: "2026-04",
        price: 59,
        returned: true,
        returnReason: "sleeves ran short",
      },
      { store: "Fleek", item: "Vintage black wool coat", category: "coat", colour: "black", date: "2026-01", price: 120 },
      { store: "Arket", item: "White poplin shirt", category: "shirt", colour: "white", date: "2026-06", price: 65 },
    ],
    consents: { runway: true, archive: true },
  },
  bea: {
    id: "bea",
    name: "Bea",
    sizes: { top: "M", bottom: "10", shoe: "6" },
    budget: { top: [15, 60], bottom: [20, 70], outer: [30, 90], dress: [20, 100] },
    coloursLiked: ["red", "green", "yellow", "white"],
    coloursAvoided: ["beige", "brown", "grey"],
    fits: ["fitted", "sporty", "cropped"],
    aesthetic: ["sporty", "streetwear", "casual", "loud", "party", "fitted", "bright"],
    dealbreakerFabrics: ["wool", "tweed", "merino", "cashmere"],
    fabricNotes: { wool: "itchy", tweed: "itchy", merino: "itchy", cashmere: "itchy" },
    hates: ["oversized", "boxy", "beige"],
    likes: ["logo", "graphic", "track", "sequin"],
    brandsLiked: ["Nike", "Adidas", "Zara"],
    purchases: [
      { store: "Zara", item: "Fitted red dress", category: "dress", colour: "red", date: "2026-02", price: 45 },
      { store: "Nike", item: "Logo tee", category: "tee", colour: "white", date: "2026-04", price: 30 },
      { store: "Adidas", item: "Track top", category: "jacket", colour: "green", date: "2026-05", price: 55 },
      {
        store: "COS",
        item: "Oversized shirt",
        category: "shirt",
        colour: "white",
        date: "2026-07",
        price: 69,
        returned: true,
        returnReason: "too boxy",
      },
    ],
    consents: { runway: true, archive: false },
  },
};

export function isShopperId(x: unknown): x is ShopperId {
  return x === "alex" || x === "bea";
}

/** Unknown or missing id falls back to Alex (the original demo shopper). */
export function getProfile(id?: string | null): ShopperProfile {
  return isShopperId(id) ? PROFILES[id] : PROFILES.alex;
}

export function listProfiles(): ShopperProfile[] {
  return Object.values(PROFILES);
}

/** Legacy single-budget shopper used by lib/verdict.ts. Alex, £80, size 8. */
export { DEMO_SHOPPER };

/**
 * Adapter for `judgeProduct`, which takes one budget and one size.
 * Pass the band ceiling for the product's garment group as `budgetGbp`.
 */
export function toLegacyShopper(
  profile: ShopperProfile,
  budgetGbp?: number,
): LegacyShopper {
  const ceilings = Object.values(profile.budget).map((b) => b[1]);
  return {
    id: profile.id,
    name: profile.name,
    aesthetic: profile.aesthetic,
    dealbreakerFabrics: profile.dealbreakerFabrics,
    budgetGbp: budgetGbp ?? Math.max(...ceilings),
    size: profile.sizes.bottom,
    hates: profile.hates,
  };
}

// —— Signals derived from history ——

export type SignalKind = "fit" | "return" | "fabric" | "colour" | "brand";

export type Signal = {
  kind: SignalKind;
  /** Machine key, e.g. "wide-leg", "sleeve", "wool". */
  key: string;
  /** Short line for the strip / API, e.g. "wide-leg: strong (3 buys at COS)". */
  text: string;
  /** Short Miranda aside used inside reason lines. */
  aside: string;
  /** Very short form for the "Miranda knows" strip, e.g. "3 wide-leg at COS". */
  short: string;
  strength: "strong" | "note" | "avoid";
};

const FIT_WORDS = ["wide-leg", "fitted", "oversized", "tailored", "logo", "track", "structured"];

function uniq<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

export function deriveSignalFacts(profile: ShopperProfile): Signal[] {
  const out: Signal[] = [];
  const kept = profile.purchases.filter((p) => !p.returned);
  const returned = profile.purchases.filter((p) => p.returned);

  // 1. Repeat fits / motifs across stores.
  for (const word of FIT_WORDS) {
    const hits = kept.filter((p) => p.item.toLowerCase().includes(word));
    if (hits.length === 0) continue;
    const stores = uniq(hits.map((h) => h.store)).join(", ");
    if (hits.length >= 2) {
      out.push({
        kind: "fit",
        key: word,
        text: `${word}: strong (${hits.length} buys at ${stores})`,
        aside: `${hits.length} at ${stores}`,
        short: `${hits.length} ${word} at ${stores}`,
        strength: "strong",
      });
    } else {
      out.push({
        kind: "fit",
        key: word,
        text: `${word}: yes (${stores})`,
        aside: `your ${hits[0].store} one`,
        short: `${word} (${hits[0].store})`,
        strength: "note",
      });
    }
  }

  // 2. Returns and what they teach.
  for (const r of returned) {
    const reason = (r.returnReason ?? "").toLowerCase();
    if (/sleeve/.test(reason)) {
      out.push({
        kind: "return",
        key: "sleeve",
        text: `sleeve length: runs long (returned ${r.store}, ${r.returnReason})`,
        aside: `returned ${r.store} for less`,
        short: `returned ${r.store} (sleeves)`,
        strength: "avoid",
      });
    } else if (/boxy|oversized|big|baggy/.test(reason)) {
      out.push({
        kind: "return",
        key: "oversized",
        text: `oversized: avoid (returned ${r.store}, ${r.returnReason})`,
        aside: `returned ${r.store} for exactly this`,
        short: `returned ${r.store} (boxy)`,
        strength: "avoid",
      });
    } else {
      out.push({
        kind: "return",
        key: r.category,
        text: `${r.category}: returned at ${r.store} (${r.returnReason ?? "no reason"})`,
        aside: `returned ${r.store}`,
        short: `returned ${r.store} (${r.category})`,
        strength: "avoid",
      });
    }
  }

  // 3. Fabrics that are out. Fabrics sharing one note collapse to one line.
  const byNote = new Map<string, string[]>();
  for (const f of profile.dealbreakerFabrics) {
    if (f === "poly") continue;
    const note = profile.fabricNotes?.[f] ?? "";
    byNote.set(note, [...(byNote.get(note) ?? []), f]);
  }
  for (const [note, fabrics] of byNote) {
    const label = fabrics.length > 1 ? `${fabrics[0]} family` : fabrics[0];
    out.push({
      kind: "fabric",
      key: fabrics[0],
      text: note && note !== "no" ? `${label}: avoid (${note})` : `${label}: never`,
      aside: note ? `You said ${note.toLowerCase()}.` : "You said no.",
      short: `no ${label}`,
      strength: "avoid",
    });
  }

  // 4. Dominant colour in what was kept.
  if (kept.length > 0) {
    const counts = new Map<string, number>();
    for (const k of kept) counts.set(k.colour, (counts.get(k.colour) ?? 0) + 1);
    const [top, n] = Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0];
    if (n >= 2) {
      out.push({
        kind: "colour",
        key: top,
        text: `${top}: ${n} of ${kept.length} buys`,
        aside: `${n} of your last ${kept.length}`,
        short: `${top} ${n}/${kept.length}`,
        strength: "strong",
      });
    }
  }

  // 5. Repeat brands.
  if (profile.brandsLiked.length > 0) {
    out.push({
      kind: "brand",
      key: "brands",
      text: `brands: ${profile.brandsLiked.join(", ")}`,
      aside: profile.brandsLiked.join(", "),
      short: profile.brandsLiked.join(" · "),
      strength: "note",
    });
  }

  return out;
}

/** Deterministic short strings from history. Same input, same output. */
export function deriveSignals(profile: ShopperProfile): string[] {
  return deriveSignalFacts(profile).map((s) => s.text);
}

/** Strip form: "3 wide-leg at COS · returned H&M (sleeves) · no polyester". */
export function signalStrip(profile: ShopperProfile, max = 4): string[] {
  return deriveSignalFacts(profile)
    .filter((s) => s.kind !== "brand")
    .slice(0, max)
    .map((s) => s.short);
}

/** What a consented store is allowed to see. Never purchases, never chat. */
export function consentedCard(profile: ShopperProfile) {
  return {
    id: profile.id,
    name: profile.name,
    sizes: profile.sizes,
    budget: profile.budget,
    coloursLiked: profile.coloursLiked,
    coloursAvoided: profile.coloursAvoided,
    fits: profile.fits,
    aesthetic: profile.aesthetic,
    dealbreakerFabrics: profile.dealbreakerFabrics,
    signals: deriveSignals(profile),
    historyCount: profile.purchases.length,
  };
}

export function hasConsent(profile: ShopperProfile, store: string): boolean {
  return profile.consents[store] === true;
}
