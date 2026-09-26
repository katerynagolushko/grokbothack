import crypto from "node:crypto";
import {
  garmentWord,
  type GarmentKind,
  type QueryIntent,
} from "./intent";
import { currentModel, findRetailerHits, llmAvailable, type RetailerHit } from "./llm";
import type { Product } from "./types";

/**
 * Live clothes for any query that is not the locked black-blazer demo.
 *
 * OpenAI Responses web_search finds real PDPs + image URLs. Card images go
 * through /api/product-image (our origin proxies bytes — retailer CDNs 403
 * WhatsApp hotlinks). Never Wikimedia / Openverse. If search fails, fall back
 * to shop-search Links without photos rather than a wrong garment.
 */

export type WebSearchMeta = {
  providers: string[];
  openaiHits: number;
  model: string | null;
  pagesFetched: number;
  imagesKept: number;
};

let lastMeta: WebSearchMeta = {
  providers: [],
  openaiHits: 0,
  model: null,
  pagesFetched: 0,
  imagesKept: 0,
};

export function lastWebSearchMeta(): WebSearchMeta {
  return lastMeta;
}

const cache = new Map<string, Product[]>();
const CACHE_MAX = 200;

function remember(key: string, value: Product[]) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

const RETAILERS: { name: string; searchUrl: (q: string) => string }[] = [
  { name: "ASOS", searchUrl: (q) => `https://www.asos.com/search/?q=${encodeURIComponent(q)}` },
  {
    name: "Zara",
    searchUrl: (q) => `https://www.zara.com/uk/en/search?searchTerm=${encodeURIComponent(q)}`,
  },
  { name: "Mango", searchUrl: (q) => `https://shop.mango.com/gb/search?kw=${encodeURIComponent(q)}` },
  {
    name: "H&M",
    searchUrl: (q) => `https://www2.hm.com/en_gb/search-results.html?q=${encodeURIComponent(q)}`,
  },
  { name: "COS", searchUrl: (q) => `https://www.cos.com/en-gb/search?q=${encodeURIComponent(q)}` },
];

const STOCK_HOST =
  /wikimedia|openverse|pexels|unsplash|flickr|pixabay|shutterstock/i;

const FABRIC_WORDS = [
  "wool", "cotton", "silk", "linen", "cashmere", "merino", "leather", "denim",
  "viscose", "satin", "tweed", "velvet", "polyester",
];

const COLOUR_HEX: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f4f1ea",
  red: "#8b2942",
  blue: "#2a4a7a",
  navy: "#1b2a4a",
  green: "#2d4a3a",
  brown: "#5c4a3a",
  camel: "#c4a574",
  grey: "#6b7c85",
  gold: "#c9a227",
  beige: "#c4b7a6",
  pink: "#c48a96",
  purple: "#5a3a6a",
  yellow: "#c9b44a",
};

function hash8(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);
}

function pickRetailers(query: string, n: number) {
  const start = parseInt(hash8(query), 16) % RETAILERS.length;
  return Array.from({ length: n }, (_, i) => RETAILERS[(start + i) % RETAILERS.length]!);
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function aestheticFor(garment: GarmentKind): string[] {
  switch (garment) {
    case "blazer":
    case "coat":
    case "trousers":
      return ["tailored", "structured"];
    case "shirt":
    case "knit":
    case "cardigan":
    case "skirt":
    case "dress":
      return ["minimal"];
    case "tee":
    case "top":
      return ["casual", "minimal"];
    case "jeans":
    case "jacket":
      return ["casual"];
    default:
      return ["casual"];
  }
}

function inferFabric(intent: QueryIntent, title: string, hit?: RetailerHit): string {
  if (intent.fabrics[0]) return intent.fabrics[0];
  const hitFab = hit?.fabric?.toLowerCase().trim();
  if (hitFab && hitFab !== "unlisted" && FABRIC_WORDS.includes(hitFab)) return hitFab;
  const hay = title.toLowerCase();
  for (const f of FABRIC_WORDS) {
    if (hay.includes(f)) return f;
  }
  return "unlisted";
}

function priceFor(key: string, budgetHint: number | null, hit?: RetailerHit): number {
  if (hit?.priceGbp && hit.priceGbp > 0) return Math.round(hit.priceGbp);
  const n = parseInt(hash8(key), 16);
  return (budgetHint ? Math.max(20, Math.round(budgetHint * 0.55)) : 35) + (n % 70);
}

function buildQuery(intent: QueryIntent, garment: GarmentKind): string {
  const bits: string[] = [];
  if (intent.colours[0]) bits.push(intent.colours[0]);
  if (intent.fabrics[0]) bits.push(intent.fabrics[0]);
  bits.push(garmentWord(garment));
  return bits.join(" ");
}

function shopKeyForDest(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("asos")) return "asos";
    if (host.includes("zara")) return "zara";
    if (host.includes("mango")) return "mango";
    if (host.includes("hm.com")) return "hm";
    if (host.includes("cos.com")) return "cos";
  } catch {
    /* */
  }
  return null;
}

function isSearchPage(url: string): boolean {
  return /[?&](q|kw|searchTerm|search)=/i.test(url) || /\/search(?:-results)?\b/i.test(url);
}

/**
 * Relative proxy path. journey.toStop absolutises with NEXT_PUBLIC_APP_URL /
 * request host so WhatsApp fetches our origin, not the retailer CDN.
 */
export function proxyProductImage(upstream: string | undefined): string | undefined {
  if (!upstream || !/^https:\/\//i.test(upstream)) return undefined;
  try {
    const host = new URL(upstream).hostname;
    if (STOCK_HOST.test(host)) return undefined;
  } catch {
    return undefined;
  }
  return `/api/product-image?u=${encodeURIComponent(upstream)}`;
}

export async function searchWebProducts(
  intent: QueryIntent,
  limit = 3,
): Promise<Product[]> {
  const garment = intent.garments[0];
  lastMeta = {
    providers: [],
    openaiHits: 0,
    model: llmAvailable() ? currentModel() : null,
    pagesFetched: 0,
    imagesKept: 0,
  };
  if (!garment) return [];
  const query = buildQuery(intent, garment);
  const cacheKey = `openai-pdp:${query.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  const colour = intent.colours[0];
  const label = titleCase([colour, garmentWord(garment)].filter(Boolean).join(" "));

  const hits = llmAvailable()
    ? await findRetailerHits(query).catch(() => [] as RetailerHit[])
    : [];

  const products: Product[] = [];
  const usedShops = new Set<string>();
  const usedUrls = new Set<string>();

  for (const hit of hits) {
    if (products.length >= limit) break;
    if (isSearchPage(hit.url)) continue;
    const key = shopKeyForDest(hit.url) ?? hit.retailer.toLowerCase();
    if (usedShops.has(key) || usedUrls.has(hit.url.toLowerCase())) continue;
    usedShops.add(key);
    usedUrls.add(hit.url.toLowerCase());
    products.push({
      id: `ext-${hash8(hit.url)}`,
      store: "web",
      title: hit.title.trim() || `${hit.retailer} ${label}`,
      priceGbp: priceFor(hit.url, intent.maxBudgetGbp, hit),
      fabric: inferFabric(intent, hit.title, hit),
      size: "8",
      aesthetic: aestheticFor(garment),
      colour: COLOUR_HEX[colour ?? ""] ?? "#444444",
      colourName: colour,
      category: garment,
      sellerPitch: "From the web.",
      // Proxy only — never hotlink retailer CDN to WhatsApp.
      imageUrl: proxyProductImage(hit.imageUrl),
      source: "web",
      sourceUrl: hit.url,
    });
  }

  // Pad so clothing asks always get cards (search Link, no invented photo).
  for (const shop of pickRetailers(query, limit)) {
    if (products.length >= limit) break;
    const key = shopKeyForDest(shop.searchUrl(query));
    if (key && usedShops.has(key)) continue;
    if (key) usedShops.add(key);
    const sourceUrl = shop.searchUrl(query);
    products.push({
      id: `ext-${hash8(sourceUrl)}`,
      store: "web",
      title: `${shop.name} ${label}`,
      priceGbp: priceFor(sourceUrl, intent.maxBudgetGbp),
      fabric: inferFabric(intent, label),
      size: "8",
      aesthetic: aestheticFor(garment),
      colour: COLOUR_HEX[colour ?? ""] ?? "#444444",
      colourName: colour,
      category: garment,
      sellerPitch: "From the web.",
      source: "web",
      sourceUrl,
    });
  }

  const imagesKept = products.filter((p) => p.imageUrl).length;
  lastMeta = {
    providers: hits.length ? ["openai-web_search"] : ["local-shop-search"],
    openaiHits: hits.length,
    model: llmAvailable() ? currentModel() : null,
    pagesFetched: products.length,
    imagesKept,
  };
  const out = products.length > 0 ? products : buildLocalShopProducts(intent, limit);
  if (out.length > 0) remember(cacheKey, out);
  return out.slice(0, limit);
}

/**
 * Sync fallback so a clothing ask never returns zero cards when search fails.
 * Link goes to a real retailer search page; image omitted (swatch).
 */
export function buildLocalShopProducts(intent: QueryIntent, limit = 3): Product[] {
  const garment = (intent.garments[0] ?? "top") as GarmentKind;
  const query = buildQuery(intent, garment);
  const colour = intent.colours[0];
  const label = titleCase([colour, garmentWord(garment)].filter(Boolean).join(" "));
  return pickRetailers(query, limit).map((shop) => {
    const url = shop.searchUrl(query);
    return {
      id: `ext-${hash8(url)}`,
      store: "web" as const,
      title: `${shop.name} ${label}`,
      priceGbp: priceFor(url, intent.maxBudgetGbp),
      fabric: inferFabric(intent, label),
      size: "8",
      aesthetic: aestheticFor(garment),
      colour: COLOUR_HEX[colour ?? ""] ?? "#444444",
      colourName: colour,
      category: garment,
      sellerPitch: "From the web.",
      source: "web" as const,
      sourceUrl: url,
    };
  });
}

export function resetWebImageCacheForTests() {
  cache.clear();
  lastMeta = {
    providers: [],
    openaiHits: 0,
    model: null,
    pagesFetched: 0,
    imagesKept: 0,
  };
}
