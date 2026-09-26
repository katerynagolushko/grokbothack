import crypto from "node:crypto";
import {
  garmentSearchTerms,
  garmentWord,
  type GarmentKind,
  type QueryIntent,
} from "./intent";
import { currentModel, findRetailerHits, llmAvailable, type RetailerHit } from "./llm";
import type { Product } from "./types";

/**
 * Live clothes for any query that is not the locked black-blazer demo.
 *
 * Card Link = real retailer search or product URL.
 * Card image = same shop’s product photo only (site-scoped CDN search / LLM
 * PDP image). Never Wikimedia / Openverse / Pexels. Garment sanity check;
 * unverified → swatch, still title + Link.
 *
 * Images are served via /api/product-image so WhatsApp can fetch our origin
 * (retailer CDNs often 403 hotlinks).
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

const TIMEOUT_MS = 5000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const STOCK_HOST =
  /wikimedia|openverse|pexels|unsplash|flickr|pixabay|shutterstock/i;

const RETAILERS: { name: string; searchUrl: (q: string) => string; key: string }[] = [
  { name: "ASOS", key: "asos", searchUrl: (q) => `https://www.asos.com/search/?q=${encodeURIComponent(q)}` },
  {
    name: "Zara",
    key: "zara",
    searchUrl: (q) => `https://www.zara.com/uk/en/search?searchTerm=${encodeURIComponent(q)}`,
  },
  { name: "Mango", key: "mango", searchUrl: (q) => `https://shop.mango.com/gb/search?kw=${encodeURIComponent(q)}` },
  {
    name: "H&M",
    key: "hm",
    searchUrl: (q) => `https://www2.hm.com/en_gb/search-results.html?q=${encodeURIComponent(q)}`,
  },
  { name: "COS", key: "cos", searchUrl: (q) => `https://www.cos.com/en-gb/search?q=${encodeURIComponent(q)}` },
];

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

const CONFLICT_TERMS: Record<GarmentKind, string[]> = {
  trousers: ["t-shirt", "tshirt", "tee", "dress", "blazer", "skirt", "jacket", "coat", "hoodie", "jumper", "sweater"],
  jeans: ["t-shirt", "tshirt", "tee", "dress", "blazer", "skirt", "blouse"],
  tee: ["dress", "blazer", "trouser", "trousers", "pant", "pants", "skirt", "jean", "jeans", "coat", "jacket"],
  shirt: ["dress", "blazer", "trouser", "trousers", "pant", "pants", "skirt", "t-shirt", "tshirt", "tee"],
  dress: ["trouser", "trousers", "pant", "pants", "blazer", "jean", "jeans", "t-shirt", "tshirt", "tee"],
  blazer: ["t-shirt", "tshirt", "tee", "dress", "trouser", "trousers", "pant", "pants", "skirt"],
  jacket: ["t-shirt", "tshirt", "tee", "dress", "skirt", "trouser", "trousers"],
  coat: ["t-shirt", "tshirt", "tee", "dress", "skirt"],
  skirt: ["trouser", "trousers", "pant", "pants", "blazer", "jean", "jeans", "t-shirt", "tshirt"],
  top: ["dress", "blazer", "trouser", "trousers", "pant", "pants", "jean", "jeans"],
  knit: ["dress", "blazer", "trouser", "trousers", "pant", "pants", "t-shirt", "tshirt", "tee"],
  cardigan: ["dress", "trouser", "trousers", "pant", "pants", "t-shirt", "tshirt"],
  hoodie: ["dress", "blazer", "skirt", "trouser", "trousers"],
  sweat: ["dress", "blazer", "skirt", "trouser", "trousers"],
};

const REJECT_AUDIENCE =
  /\b(kanzu|uniform|child|children|kids|toddler|baby|teen|boys?|girls?|doll|cosplay|mannequin|pattern|sewing|drawing|illustration|painting|clipart|diagram)\b/i;

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

function shopKeyFromHosts(imgHost: string, pageHost: string): string | null {
  const h = `${imgHost} ${pageHost}`.toLowerCase();
  if (/asos/.test(h)) return "asos";
  if (/zara/.test(h)) return "zara";
  if (/mango/.test(h)) return "mango";
  if (/\.hm\.|hm\.com|lpstatic|image\.hm/.test(h)) return "hm";
  if (/cos\.com|cosstores|arket|stories/.test(h)) return "cos";
  return null;
}

function haystackHasTerm(hay: string, term: string): boolean {
  const t = term.toLowerCase();
  if (t.includes(" ")) return hay.includes(t);
  return new RegExp(
    `(?:^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[^a-z0-9]|$)`,
    "i",
  ).test(hay);
}

/** Keep only images we can verify as the requested garment. */
export function imageMatchesGarment(
  garment: GarmentKind,
  parts: { url: string; alt?: string; title?: string },
): boolean {
  const hay = `${parts.url} ${parts.alt ?? ""} ${parts.title ?? ""}`.toLowerCase();
  if (!hay.trim()) return false;
  if (REJECT_AUDIENCE.test(hay)) return false;
  if (/\b(logo|favicon|sprite|banner|placeholder)\b/i.test(hay)) return false;

  const positives = garmentSearchTerms(garment).map((t) => t.toLowerCase());
  if (garment === "trousers") positives.push("bryuki", "pants", "pantalon", "chino");
  if (garment === "tee") positives.push("futbolka", "tshirt", "tee-shirt");
  const hasPositive = positives.some((t) => haystackHasTerm(hay, t));
  const conflicts = CONFLICT_TERMS[garment] ?? [];
  const hasConflict = conflicts.some((t) => haystackHasTerm(hay, t));
  if (hasConflict && !hasPositive) return false;
  if (!hasPositive) return false;
  return true;
}

/** Relative proxy path so WhatsApp fetches our origin, not the retailer CDN. */
export function proxyProductImage(upstream: string | undefined): string | undefined {
  if (!upstream || !/^https:\/\//i.test(upstream)) return undefined;
  try {
    if (STOCK_HOST.test(new URL(upstream).hostname)) return undefined;
  } catch {
    return undefined;
  }
  return `/api/product-image?u=${encodeURIComponent(upstream)}`;
}

async function fetchText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: ctrl.signal,
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type CdnHit = { imageUrl: string; productUrl?: string; title?: string; shopKey: string };

async function yandexImages(
  q: string,
): Promise<Array<{ image: string; title: string; url: string }>> {
  const html = await fetchText(
    `https://yandex.com/images/search?text=${encodeURIComponent(q)}`,
  );
  if (!html) return [];
  const out: Array<{ image: string; title: string; url: string }> = [];
  const seen = new Set<string>();

  const pushImage = (raw: string) => {
    const image = raw
      .replace(/\\u0026/g, "&")
      .replace(/&amp;/g, "&")
      .replace(/\\+/g, "")
      .replace(/&quot;.*$/, "")
      .replace(/".*$/, "");
    if (!/^https:\/\//i.test(image) || seen.has(image)) return;
    if (STOCK_HOST.test(image)) return;
    seen.add(image);
    let title = "";
    try {
      title = decodeURIComponent(new URL(image).pathname).replace(/[-_/]+/g, " ");
    } catch {
      title = "";
    }
    out.push({ image, title, url: "" });
  };

  for (const m of html.matchAll(/img_href&quot;:&quot;(https:[^&]+?)&quot;/g)) pushImage(m[1]);
  for (const m of html.matchAll(/"img_href"\s*:\s*"(https:[^"]+)"/g)) pushImage(m[1]);
  for (const m of html.matchAll(
    /https:\/\/(?:images\.asos-media\.com|static\.zara\.net|media\.mango\.com|image\.hm\.com|shop\.mango\.com\/assets)\/[^"'\\\s<>]+/gi,
  )) {
    pushImage(m[0]);
  }

  for (const m of html.matchAll(
    /https:\/\/(?:www\.)?(?:asos\.com|zara\.com|shop\.mango\.com|www2?\.hm\.com|cos\.com)\/[^"'\\\s<>]+/gi,
  )) {
    const page = m[0].replace(/&amp;/g, "&").replace(/&quot;.*$/, "");
    let pageSlug = "";
    try {
      pageSlug = decodeURIComponent(new URL(page).pathname).toLowerCase();
    } catch {
      continue;
    }
    const pageId = pageSlug.match(/\/prd\/(\d+)/)?.[1] ?? pageSlug.match(/\/(\d{6,})\b/)?.[1];
    for (const r of out) {
      if (r.url) continue;
      if (shopKeyFromHosts(new URL(r.image).hostname, "") !== shopKeyForDest(page)) continue;
      const imgPath = decodeURIComponent(new URL(r.image).pathname).toLowerCase();
      const imgId = imgPath.match(/\/(\d{6,})\b/)?.[1];
      if (pageId && imgId && pageId !== imgId) continue;
      if (!pageId || !imgId) {
        const pageTokens = new Set(pageSlug.split(/[^a-z0-9]+/).filter((t) => t.length > 3));
        const imgTokens = imgPath.split(/[^a-z0-9]+/).filter((t) => t.length > 3);
        if (!imgTokens.some((t) => pageTokens.has(t))) continue;
      }
      r.url = page;
      break;
    }
  }
  return out.slice(0, 40);
}

async function poolRetailerCdnHits(query: string, garment: GarmentKind): Promise<CdnHit[]> {
  const siteQueries: { q: string; shopHint: string }[] = [
    { q: `site:asos.com ${query}`, shopHint: "asos" },
    { q: `site:zara.com ${query}`, shopHint: "zara" },
    { q: `site:shop.mango.com ${query}`, shopHint: "mango" },
    { q: `site:hm.com ${query}`, shopHint: "hm" },
    { q: `site:cos.com ${query}`, shopHint: "cos" },
  ];
  const batches = await Promise.all(
    siteQueries.map(async ({ q, shopHint }) => {
      const found = await yandexImages(q);
      return found.map((r) => ({ ...r, shopHint }));
    }),
  );

  const out: CdnHit[] = [];
  const seen = new Set<string>();
  for (const r of batches.flat()) {
    if (seen.has(r.image)) continue;
    const verifyTitle = `${query} ${r.title}`;
    if (!imageMatchesGarment(garment, { url: r.image, alt: r.title, title: verifyTitle })) {
      continue;
    }
    let imgHost = "";
    try {
      imgHost = new URL(r.image).hostname;
    } catch {
      continue;
    }
    if (STOCK_HOST.test(imgHost)) continue;
    const fromHost = shopKeyFromHosts(imgHost, "");
    if (!fromHost) continue;
    const shopKey = fromHost;
    seen.add(r.image);
    out.push({
      imageUrl: r.image,
      productUrl: r.url || undefined,
      title: r.title,
      shopKey,
    });
  }
  return out;
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
  const cacheKey = `retailer-matched:${query.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  const colour = intent.colours[0];
  const label = titleCase([colour, garmentWord(garment)].filter(Boolean).join(" "));

  const hits = llmAvailable()
    ? await findRetailerHits(query).catch(() => [] as RetailerHit[])
    : [];

  const cdnPool = await poolRetailerCdnHits(query, garment);
  const products: Product[] = [];
  const usedShops = new Set<string>();

  for (const hit of hits) {
    if (products.length >= limit) break;
    const key = shopKeyForDest(hit.url);
    if (!key || usedShops.has(key)) continue;
    const cdnIdx = cdnPool.findIndex((c) => c.shopKey === key);
    const cdn = cdnIdx >= 0 ? cdnPool.splice(cdnIdx, 1)[0] : undefined;
    let upstream = hit.imageUrl;
    if (
      upstream &&
      !imageMatchesGarment(garment, { url: upstream, title: hit.title, alt: hit.title })
    ) {
      upstream = undefined;
    }
    usedShops.add(key);
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
      imageUrl: proxyProductImage(upstream ?? cdn?.imageUrl),
      source: "web",
      sourceUrl: hit.url,
    });
  }

  for (const cdn of [...cdnPool]) {
    if (products.length >= limit) break;
    if (usedShops.has(cdn.shopKey)) continue;
    usedShops.add(cdn.shopKey);
    const shop = RETAILERS.find((r) => r.key === cdn.shopKey) ?? RETAILERS[0]!;
    const sourceUrl = cdn.productUrl || shop.searchUrl(query);
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
      imageUrl: proxyProductImage(cdn.imageUrl),
      source: "web",
      sourceUrl,
    });
  }

  for (const shop of pickRetailers(query, limit)) {
    if (products.length >= limit) break;
    if (usedShops.has(shop.key)) continue;
    usedShops.add(shop.key);
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
    providers: ["retailer-page"],
    openaiHits: hits.length,
    model: llmAvailable() ? currentModel() : null,
    pagesFetched: products.length,
    imagesKept,
  };
  if (products.length > 0) remember(cacheKey, products);
  return products.slice(0, limit);
}

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
