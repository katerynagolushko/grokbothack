import {
  deriveSignalFacts,
  listProfiles,
  type Purchase,
  type ShopperProfile as PortableProfile,
  type Signal,
} from "./profiles";
import { PRODUCTS } from "./products";
import { DEMO_SHOPPER } from "./shopper";
import type { Product, ShopperProfile, VerdictKind } from "./types";
import { judgeProduct, storeCounts } from "./verdict";

const VIEWPORT = 8;

function verdictRank(kind: VerdictKind): number {
  if (kind === "suggest") return 0;
  if (kind === "meh") return 1;
  return 2;
}

function sortByTaste(products: Product[], shopper: ShopperProfile): Product[] {
  return [...products].sort(
    (a, b) =>
      verdictRank(judgeProduct(a, shopper).kind) -
      verdictRank(judgeProduct(b, shopper).kind),
  );
}

function matchRateInTop(
  products: Product[],
  shopper: ShopperProfile,
  topN: number,
): number {
  const slice = products.slice(0, topN);
  if (slice.length === 0) return 0;
  const hits = slice.filter(
    (p) => judgeProduct(p, shopper).kind === "suggest",
  ).length;
  return Math.round((hits / slice.length) * 100);
}

/** Consented fields a merchant may see — never chat or private verdicts. */
export type TasteCard = {
  shopperName: string;
  sizeBand: string;
  budgetBand: string;
  aesthetics: string[];
  dealbreakers: string[];
};

/* ——————————————————————————————————————————————————————————————————————
 * Cross-store view for the merchant page. Reads the portable profiles in
 * `lib/profiles.ts` (same data the /api/profile and /api/rank routes use),
 * so the numbers on /merchant agree with the API. All data is mock.
 * —————————————————————————————————————————————————————————————————————— */

/** Partner stores that can call the API. */
export type PartnerStore = "runway" | "archive";

export const PARTNER_STORES: PartnerStore[] = ["runway", "archive"];

/** A signal derived from purchases at other brands; never the raw receipts. */
export type DerivedSignal = {
  /** Short label a merchant sees, e.g. "Wide-leg: strong". */
  label: string;
  /** Evidence line, e.g. "3 buys at COS". */
  evidence: string;
  strength: Signal["strength"];
};

export type CrossStoreProfile = {
  id: string;
  name: string;
  /** Plain-English style line for the card. */
  style: string;
  size: string;
  /** Purchase rows across other brands (mock). */
  purchases: Purchase[];
  /** History-derived signals only (fit, return, colour). Not profile-declared ones. */
  signals: DerivedSignal[];
  consents: Record<PartnerStore, boolean>;
};

const HISTORY_KINDS = new Set<Signal["kind"]>(["fit", "return", "colour"]);
const STRENGTH_ORDER: Record<Signal["strength"], number> = {
  strong: 0,
  avoid: 1,
  note: 2,
};

/** "wide-leg: strong (3 buys at COS)" → { label: "Wide-leg: strong", evidence: "3 buys at COS" }. */
function splitSignal(sig: Signal): DerivedSignal {
  const text = sig.text;
  const paren = text.indexOf(" (");
  let label = text;
  let evidence = "";
  if (paren > 0 && text.endsWith(")")) {
    label = text.slice(0, paren);
    evidence = text.slice(paren + 2, -1);
  } else {
    const colon = text.indexOf(": ");
    if (colon > 0) {
      label = text.slice(0, colon);
      evidence = text.slice(colon + 2);
    }
  }
  return { label: capitalise(label), evidence, strength: sig.strength };
}

/** Signals a store could not have derived from its own data. */
export function historySignals(profile: PortableProfile): DerivedSignal[] {
  return deriveSignalFacts(profile)
    .filter((s) => HISTORY_KINDS.has(s.kind))
    .sort((a, b) => STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength])
    .map(splitSignal);
}

function styleLine(profile: PortableProfile): string {
  const words = [...profile.aesthetic.slice(0, 3), ...profile.fits.slice(0, 1)];
  return capitalise(Array.from(new Set(words)).join(", "));
}

export function toCrossStoreProfile(profile: PortableProfile): CrossStoreProfile {
  const consents = {} as Record<PartnerStore, boolean>;
  for (const store of PARTNER_STORES) {
    consents[store] = profile.consents[store] === true;
  }
  return {
    id: profile.id,
    name: profile.name,
    style: styleLine(profile),
    size: profile.sizes.bottom,
    purchases: profile.purchases,
    signals: historySignals(profile),
    consents,
  };
}

export const CROSS_STORE_PROFILES: CrossStoreProfile[] = listProfiles().map(
  toCrossStoreProfile,
);

export function getCrossStoreProfile(id: string): CrossStoreProfile | undefined {
  return CROSS_STORE_PROFILES.find((p) => p.id === id);
}

/** Purchase rows across all brands. */
export function crossStoreItemCount(profile: CrossStoreProfile): number {
  return profile.purchases.length;
}

export function crossStoreBrandCount(profile: CrossStoreProfile): number {
  return new Set(profile.purchases.map((p) => p.store)).size;
}

export function crossStoreReturnCount(profile: CrossStoreProfile): number {
  return profile.purchases.filter((p) => p.returned).length;
}

/**
 * History-derived signals a partner store gets that it could not have
 * derived itself. Zero when that store has no consent.
 */
export function crossStoreSignalsUsed(
  profile: CrossStoreProfile,
  store: PartnerStore,
): number {
  if (!profile.consents[store]) return 0;
  return profile.signals.length;
}

export type MerchantProof = {
  catalogueSize: number;
  badTakes: number;
  suggested: number;
  meh: number;
  wastePct: number;
  matchRateOff: number;
  matchRateOn: number;
  viewport: number;
  genericOrder: Product[];
  mirandaOrder: Product[];
  tasteCard: TasteCard;
  /** Derived signals from other brands that fed the reorder. */
  crossStoreSignals: number;
};

export function buildTasteCard(shopper: ShopperProfile = DEMO_SHOPPER): TasteCard {
  return {
    shopperName: shopper.name,
    sizeBand: shopper.size,
    budgetBand: `≤ £${shopper.budgetGbp}`,
    aesthetics: [...shopper.aesthetic],
    dealbreakers: [
      ...shopper.dealbreakerFabrics.map((f) => capitalise(f)),
      ...shopper.hates.map((h) => capitalise(h)),
    ],
  };
}

/**
 * Proof metrics from the same seed profile + catalogue as the buyer demo.
 * Match rates compare the first VIEWPORT tiles: catalogue order vs taste reorder.
 */
export function computeMerchantProof(
  products: Product[] = PRODUCTS,
  shopper: ShopperProfile = DEMO_SHOPPER,
  store: PartnerStore = "runway",
): MerchantProof {
  const counts = storeCounts(products, shopper);
  const catalogueSize = products.length;
  const wastePct =
    catalogueSize === 0
      ? 0
      : Math.round((counts.bad / catalogueSize) * 100);
  const mirandaOrder = sortByTaste(products, shopper);
  const crossStore = getCrossStoreProfile(shopper.id);
  const crossStoreSignals = crossStore
    ? crossStoreSignalsUsed(crossStore, store)
    : 0;

  return {
    catalogueSize,
    badTakes: counts.bad,
    suggested: counts.suggest,
    meh: counts.meh,
    wastePct,
    matchRateOff: matchRateInTop(products, shopper, VIEWPORT),
    matchRateOn: matchRateInTop(mirandaOrder, shopper, VIEWPORT),
    viewport: VIEWPORT,
    genericOrder: products,
    mirandaOrder,
    tasteCard: buildTasteCard(shopper),
    crossStoreSignals,
  };
}

function capitalise(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
