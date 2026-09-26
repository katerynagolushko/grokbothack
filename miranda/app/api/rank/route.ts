import { NextRequest } from "next/server";
import { getProduct, getStoreProducts } from "@/lib/products";
import { getProfile, hasConsent, isShopperId, deriveSignals } from "@/lib/profiles";
import { rankCounts, rankForShopper } from "@/lib/rank";
import { corsJson, corsPreflight } from "@/lib/storeApi";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  user?: string;
  store?: string;
  products?: { id: string }[];
};

/**
 * POST /api/rank  { user, store, products?: [{ id }] }
 * Returns the store's products ordered for this shopper with a reason each.
 * `products` omitted → the whole store catalogue. 403 without consent.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return corsJson({ error: "Expected JSON { user, store, products? }." }, { status: 400 });
  }

  const { user, store } = body;
  if (!user || !isShopperId(user)) {
    return corsJson({ error: `Unknown shopper '${user ?? ""}'.` }, { status: 404 });
  }
  if (!store) {
    return corsJson({ error: "store is required." }, { status: 400 });
  }

  const profile = getProfile(user);
  if (!hasConsent(profile, store)) {
    return corsJson({ consent: false, user, store }, { status: 403 });
  }

  let pool: Product[];
  const unknown: string[] = [];
  if (Array.isArray(body.products) && body.products.length > 0) {
    pool = [];
    for (const { id } of body.products) {
      const p = getProduct(id);
      if (p) pool.push(p);
      else unknown.push(id);
    }
  } else {
    pool = getStoreProducts(store as Product["store"]);
  }

  // Products passed by id are ranked even if they belong to another store id.
  const ranked = rankForShopper(profile, pool);

  return corsJson({
    consent: true,
    user,
    store,
    counts: rankCounts(ranked),
    signals: deriveSignals(profile),
    unknown,
    items: ranked.map((r) => ({
      id: r.id,
      rank: r.rank,
      verdict: r.verdict,
      score: r.score,
      reason: r.reason,
      sizeOk: r.sizeOk,
      fromHistory: r.fromHistory,
      title: r.product.title,
      priceGbp: r.product.priceGbp,
    })),
  });
}

export function OPTIONS() {
  return corsPreflight();
}
