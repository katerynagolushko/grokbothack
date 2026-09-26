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
 * Each card Link is a real retailer search or product URL. The card image
 * comes from that same shop (page og:image, Microlink on that URL, LLM hit
 * photo, or a same-retailer CDN photo for the query). Never pairs a shop URL
 * with Wikimedia / Openverse / Pexels stock. If we cannot verify the garment,
 * omit the image (swatch) — never show a different garment.
 */

const TIMEOUT_MS = 5000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

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

async function fetchText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/json",
        ...headers,
      },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function microlinkImage(pageUrl: string): Promise<{ url: string; title: string } | null> {
  const data = (await fetchJson(
    `https://api.microlink.io/?url=${encodeURIComponent(pageUrl)}&meta=true`,
  )) as {
    status?: string;
    data?: {
      title?: string;
      image?: { url?: string } | string | null;
    };
  } | null;
  if (!data || data.status !== "success" || !data.data) return null;
  const img = data.data.image;
  const raw = typeof img === "string" ? img : img?.url;
  if (!raw || !/^https:\/\//i.test(raw)) return null;
  return { url: raw, title: data.data.title ?? "" };
}

function retailerCdnOk(pageUrl: string, imageUrl: string): boolean {
  try {
    const host = new URL(pageUrl).hostname.replace(/^www\./, "").toLowerCase();
    const imgHost = new URL(imageUrl).hostname.replace(/^www\./, "").toLowerCase();
    if (/wikimedia|openverse|pexels|unsplash|flickr|pixabay|shutterstock/i.test(imgHost)) {
      return false;
    }
    if (host.includes("asos.com")) return /asos/i.test(imgHost);
    if (host.includes("zara.com")) return /zara/i.test(imgHost);
    if (host.includes("mango.com")) return /mango/i.test(imgHost);
    if (host.includes("hm.com")) return /\.hm\.|hm\.com|lpstatic|image\.hm/i.test(imgHost);
    if (host.includes("cos.com")) return /cos|arket|stories|cdn\.shopify|cloudinary/i.test(imgHost);
    const base = host.split(".").slice(-2).join(".");
    return imgHost === host || imgHost.endsWith(`.${base}`) || imgHost.includes(base.split(".")[0]!);
  } catch {
    return false;
  }
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

function hash8(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);
}

function pickRetailers(query: string, n: number) {
  const start = parseInt(hash8(query), 16) % RETAILERS.length;
  return Array.from({ length: n }, (_, i) => RETAILERS[(start + i) % RETAILERS.length]!);
}

function absoluteUrl(base: string, maybe: string): string | null {
  const raw = maybe.trim().replace(/^["']|["']$/g, "");
  if (!raw || raw.startsWith("data:")) return null;
  try {
    const u = new URL(raw, base);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (u.protocol === "http:") u.protocol = "https:";
    return u.href;
  } catch {
    return null;
  }
}

const LOGO_OR_BANNER =
  /\b(logo|favicon|sprite|icon|banner|placeholder|default[-_]?image|og[-_]?default|social[-_]?share|apple-touch|ms-icon|brand[-_]?mark|wordmark|header[-_]?img)\b/i;

const REJECT_AUDIENCE =
  /\b(kanzu|uniform|child|children|kids|toddler|baby|teen|boys?|girls?|doll|cosplay|mannequin|pattern|sewing|drawing|illustration|painting|clipart|diagram)\b/i;

const PRODUCT_CDN =
  /\b(static\.zara\.net|lpstatic\.net|mango\.com|hm\.com|image\.hm|cosstores|asos-media|asos\.com\/.*images|media\.asos|images\.asos)\b/i;

function metaContent(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m?.[1]) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2?.[1] ?? null;
}

function pageTitle(html: string): string {
  const og = metaContent(html, "og:title");
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

type ImageCandidate = {
  url: string;
  alt: string;
  source: "og" | "twitter" | "jsonld" | "img";
};

function extractJsonLdImages(html: string, pageUrl: string): ImageCandidate[] {
  const out: ImageCandidate[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1].trim()) as unknown;
      const stack = Array.isArray(data) ? [...data] : [data];
      while (stack.length) {
        const node = stack.pop();
        if (!node || typeof node !== "object") continue;
        const rec = node as Record<string, unknown>;
        if (Array.isArray(rec["@graph"])) stack.push(...rec["@graph"]);
        const img = rec.image;
        const name = typeof rec.name === "string" ? rec.name : "";
        const push = (raw: string) => {
          const abs = absoluteUrl(pageUrl, raw);
          if (abs) out.push({ url: abs, alt: name, source: "jsonld" });
        };
        if (typeof img === "string") push(img);
        else if (Array.isArray(img)) {
          for (const item of img) {
            if (typeof item === "string") push(item);
            else if (item && typeof item === "object" && typeof (item as { url?: string }).url === "string") {
              push((item as { url: string }).url);
            }
          }
        } else if (img && typeof img === "object" && typeof (img as { url?: string }).url === "string") {
          push((img as { url: string }).url);
        }
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}

function extractImgTags(html: string, pageUrl: string): ImageCandidate[] {
  const out: ImageCandidate[] = [];
  const re = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const src =
      tag.match(/\b(?:src|data-src|data-original|data-image)=["']([^"']+)["']/i)?.[1] ??
      tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1]?.split(/[\s,]/)[0];
    if (!src) continue;
    const abs = absoluteUrl(pageUrl, src);
    if (!abs) continue;
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    out.push({ url: abs, alt, source: "img" });
  }
  return out;
}

function collectCandidates(html: string, pageUrl: string): ImageCandidate[] {
  const seen = new Set<string>();
  const ordered: ImageCandidate[] = [];
  const push = (c: ImageCandidate | null) => {
    if (!c || seen.has(c.url)) return;
    seen.add(c.url);
    ordered.push(c);
  };
  for (const prop of ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]) {
    const raw = metaContent(html, prop);
    if (!raw) continue;
    const abs = absoluteUrl(pageUrl, raw);
    if (abs) {
      push({
        url: abs,
        alt: pageTitle(html),
        source: prop.startsWith("twitter") ? "twitter" : "og",
      });
    }
  }
  for (const c of extractJsonLdImages(html, pageUrl)) push(c);
  for (const c of extractImgTags(html, pageUrl)) push(c);
  return ordered;
}

function looksLikeLogoOrBanner(url: string, alt: string): boolean {
  const hay = `${url} ${alt}`;
  if (LOGO_OR_BANNER.test(hay)) return true;
  if (/\.(svg)(\?|$)/i.test(url)) return true;
  if (/\/(logos?|icons?|brand)\//i.test(url)) return true;
  return false;
}

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

function haystackHasTerm(hay: string, term: string): boolean {
  const t = term.toLowerCase();
  if (t.includes(" ")) return hay.includes(t);
  return new RegExp(`(?:^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[^a-z0-9]|$)`, "i").test(
    hay,
  );
}

export function imageMatchesGarment(
  garment: GarmentKind,
  parts: { url: string; alt?: string; title?: string },
): boolean {
  const hay = `${parts.url} ${parts.alt ?? ""} ${parts.title ?? ""}`.toLowerCase();
  if (!hay.trim()) return false;
  if (looksLikeLogoOrBanner(parts.url, parts.alt ?? "")) return false;
  if (REJECT_AUDIENCE.test(hay)) return false;

  const positives = garmentSearchTerms(garment).map((t) => t.toLowerCase());
  // CDN path slugs are often localised; keep a few high-signal synonyms.
  if (garment === "trousers") positives.push("bryuki", "pants", "pantalon", "chino");
  if (garment === "tee") positives.push("futbolka", "tshirt", "tee-shirt");
  if (garment === "dress") positives.push("platye", "kleid");
  if (garment === "blazer") positives.push("pidzhak");
  const hasPositive = positives.some((t) => haystackHasTerm(hay, t));
  const conflicts = CONFLICT_TERMS[garment] ?? [];
  const hasConflict = conflicts.some((t) => haystackHasTerm(hay, t));

  if (hasConflict && !hasPositive) return false;
  if (!hasPositive) return false;
  return true;
}

function isSearchPage(url: string): boolean {
  return /[?&](q|kw|searchTerm|search)=/i.test(url) || /\/search\b/i.test(url);
}

function pickPageImage(html: string, pageUrl: string, garment: GarmentKind): string | undefined {
  const title = pageTitle(html);
  const candidates = collectCandidates(html, pageUrl);
  const search = isSearchPage(pageUrl);
  const ranked = [...candidates].sort((a, b) => {
    const rank = (s: ImageCandidate["source"]) =>
      s === "og" ? 0 : s === "twitter" ? 1 : s === "jsonld" ? 2 : 3;
    return rank(a.source) - rank(b.source);
  });

  for (const c of ranked) {
    const check = search
      ? { url: c.url, alt: c.alt, title: c.alt }
      : { url: c.url, alt: c.alt, title };
    if (imageMatchesGarment(garment, check)) return c.url;
  }

  if (!search && imageMatchesGarment(garment, { url: pageUrl, title, alt: title })) {
    for (const c of ranked) {
      if (looksLikeLogoOrBanner(c.url, c.alt)) continue;
      if (PRODUCT_CDN.test(c.url) || /\.(jpe?g|webp)(\?|$)/i.test(c.url)) {
        const conflicts = CONFLICT_TERMS[garment] ?? [];
        const imgHay = `${c.url} ${c.alt}`.toLowerCase();
        const imgConflict = conflicts.some((t) => haystackHasTerm(imgHay, t));
        const imgPositive = garmentSearchTerms(garment).some((t) =>
          haystackHasTerm(imgHay, t.toLowerCase()),
        );
        if (imgConflict && !imgPositive) continue;
        return c.url;
      }
    }
  }
  return undefined;
}

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

type Dest = { name: string; url: string; hit?: RetailerHit };
type CdnHit = { imageUrl: string; productUrl?: string; title?: string; shopKey: string };

let ddgLock: Promise<void> = Promise.resolve();
function withDdgLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = ddgLock.then(fn, fn);
  ddgLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function yandexImages(
  q: string,
): Promise<Array<{ image: string; title: string; url: string }>> {
  const html = await fetchText(
    `https://yandex.com/images/search?text=${encodeURIComponent(q)}`,
  );
  if (!html) return [];
  const out: Array<{ image: string; title: string; url: string }> = [];
  const seen = new Set<string>();

  const pushImage = (raw: string, titleHint = "") => {
    const image = raw
      .replace(/\\u0026/g, "&")
      .replace(/&amp;/g, "&")
      .replace(/\\+/g, "")
      .replace(/&quot;.*$/, "")
      .replace(/".*$/, "");
    if (!/^https:\/\//i.test(image) || seen.has(image)) return;
    seen.add(image);
    let title = titleHint;
    if (!title) {
      try {
        title = decodeURIComponent(new URL(image).pathname).replace(/[-_/]+/g, " ");
      } catch {
        title = "";
      }
    }
    out.push({ image, title, url: "" });
  };

  for (const m of html.matchAll(/img_href&quot;:&quot;(https:[^&]+?)&quot;/g)) {
    pushImage(m[1]);
  }
  for (const m of html.matchAll(/"img_href"\s*:\s*"(https:[^"]+)"/g)) {
    pushImage(m[1]);
  }
  for (const m of html.matchAll(
    /https:\/\/(?:images\.asos-media\.com|static\.zara\.net|media\.mango\.com|image\.hm\.com)\/[^"'\\\s<>]+/gi,
  )) {
    pushImage(m[0]);
  }

  for (const m of html.matchAll(
    /https:\/\/(?:www\.)?(?:asos\.com|zara\.com|shop\.mango\.com|www2?\.hm\.com|cos\.com)\/[^"'\\\s<>]+/gi,
  )) {
    const page = m[0].replace(/&amp;/g, "&").replace(/&quot;.*$/, "");
    for (const r of out) {
      if (!r.url && retailerCdnOk(page, r.image)) {
        r.url = page;
        try {
          const slug = decodeURIComponent(new URL(page).pathname).replace(/[-_/]+/g, " ");
          if (slug.length > r.title.length) r.title = slug;
        } catch {
          /* */
        }
        break;
      }
    }
  }
  return out.slice(0, 40);
}

async function duckDuckGoImages(
  q: string,
): Promise<Array<{ image: string; title: string; url: string }>> {
  return withDdgLock(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
      const landing = await fetchText(
        `https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=images&ia=images`,
      );
      if (!landing) continue;
      const m = landing.match(/vqd=(["']?)([^"'&]+)/);
      if (!m) continue;
      const data = (await fetchJson(
        "https://duckduckgo.com/i.js?" +
          new URLSearchParams({ l: "uk-en", o: "json", q, vqd: m[2], f: ",,," }),
        { Referer: "https://duckduckgo.com/" },
      )) as { results?: Array<{ image?: string; title?: string; url?: string }> } | null;
      if (!data?.results?.length) continue;
      return data.results
        .filter((r) => r.image && /^https:\/\//i.test(r.image))
        .map((r) => ({
          image: r.image as string,
          title: r.title ?? "",
          url: r.url && /^https:\/\//i.test(r.url) ? r.url : "",
        }));
    }
    return [];
  });
}

async function searchRetailerImages(
  q: string,
): Promise<Array<{ image: string; title: string; url: string }>> {
  const yandex = await yandexImages(q);
  if (yandex.length) return yandex;
  return duckDuckGoImages(q);
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

async function poolRetailerCdnHits(query: string, garment: GarmentKind): Promise<CdnHit[]> {
  const siteQueries = [
    `site:asos.com ${query}`,
    `site:zara.com ${query}`,
    `site:shop.mango.com ${query}`,
    `site:hm.com ${query}`,
    `site:cos.com ${query}`,
  ];
  const results: Array<{ image: string; title: string; url: string }> = [];
  for (const q of siteQueries) {
    const batch = await searchRetailerImages(q);
    results.push(...batch);
    if (results.length >= 15) break;
  }

  const out: CdnHit[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (seen.has(r.image)) continue;
    let title = r.title;
    if (!title) {
      try {
        title = decodeURIComponent(new URL(r.image).pathname).replace(/[-_/]+/g, " ");
      } catch {
        title = "";
      }
    }
    if (!imageMatchesGarment(garment, { url: r.image, alt: title, title })) continue;
    let imgHost = "";
    let pageHost = "";
    try {
      imgHost = new URL(r.image).hostname;
      pageHost = r.url ? new URL(r.url).hostname : imgHost;
    } catch {
      continue;
    }
    if (/wikimedia|openverse|pexels|unsplash|flickr|pixabay/i.test(imgHost)) continue;
    const shopKey = shopKeyFromHosts(imgHost, pageHost);
    if (!shopKey) continue;
    seen.add(r.image);
    out.push({
      imageUrl: r.image,
      productUrl: r.url || undefined,
      title,
      shopKey,
    });
  }
  return out;
}

function takeCdnForDest(dest: Dest, pool: CdnHit[]): CdnHit | undefined {
  const key = shopKeyForDest(dest.url);
  if (!key) return undefined;
  const idx = pool.findIndex((h) => h.shopKey === key);
  if (idx < 0) return undefined;
  return pool.splice(idx, 1)[0];
}

function acceptImage(
  garment: GarmentKind,
  pageUrl: string,
  imageUrl: string | undefined,
  title: string,
  alt = "",
): string | undefined {
  if (!imageUrl || !/^https:\/\//i.test(imageUrl)) return undefined;
  if (looksLikeLogoOrBanner(imageUrl, alt || title)) return undefined;
  if (!imageMatchesGarment(garment, { url: imageUrl, alt, title })) return undefined;
  if (!retailerCdnOk(pageUrl, imageUrl)) {
    try {
      const h = new URL(imageUrl).hostname;
      if (/wikimedia|openverse|pexels|unsplash|flickr|pixabay/i.test(h)) return undefined;
    } catch {
      return undefined;
    }
  }
  return imageUrl;
}

async function resolveImageForDest(
  dest: Dest,
  garment: GarmentKind,
  query: string,
  cdnPool: CdnHit[],
): Promise<{ imageUrl?: string; sourceUrl: string; title?: string }> {
  const html = await fetchText(dest.url);
  if (html) {
    const fromPage = pickPageImage(html, dest.url, garment);
    if (fromPage) return { imageUrl: fromPage, sourceUrl: dest.url };
    const micro = await microlinkImage(dest.url);
    if (micro) {
      const ok = acceptImage(garment, dest.url, micro.url, micro.title || dest.hit?.title || query);
      if (ok) return { imageUrl: ok, sourceUrl: dest.url, title: micro.title };
    }
  }

  if (dest.hit?.imageUrl) {
    const ok = acceptImage(
      garment,
      dest.url,
      dest.hit.imageUrl,
      dest.hit.title || query,
      dest.hit.title || "",
    );
    if (ok) return { imageUrl: ok, sourceUrl: dest.url, title: dest.hit.title };
  }

  const cdn = takeCdnForDest(dest, cdnPool);
  if (cdn) {
    return {
      imageUrl: cdn.imageUrl,
      sourceUrl: cdn.productUrl || dest.url,
      title: cdn.title,
    };
  }
  return { sourceUrl: dest.url };
}

async function scrapeDestination(
  dest: Dest,
  intent: QueryIntent,
  garment: GarmentKind,
  query: string,
  cdnPool: CdnHit[],
): Promise<Product | null> {
  const colour = intent.colours[0];
  const label = titleCase([colour, garmentWord(garment)].filter(Boolean).join(" "));
  const resolved = await resolveImageForDest(dest, garment, query, cdnPool);
  const title =
    dest.hit?.title?.trim() ||
    (resolved.title &&
    imageMatchesGarment(garment, { url: resolved.imageUrl ?? "", title: resolved.title })
      ? resolved.title.replace(/\s*[|·].*$/, "").trim()
      : null) ||
    `${dest.name} ${label}`;

  return {
    id: `ext-${hash8(resolved.sourceUrl)}`,
    store: "web",
    title,
    priceGbp: priceFor(resolved.sourceUrl, intent.maxBudgetGbp, dest.hit),
    fabric: inferFabric(intent, `${title} ${dest.hit?.title ?? ""}`, dest.hit),
    size: "8",
    aesthetic: aestheticFor(garment),
    colour: COLOUR_HEX[colour ?? ""] ?? "#444444",
    colourName: colour,
    category: garment,
    sellerPitch: "From the web.",
    imageUrl: resolved.imageUrl,
    source: "web",
    sourceUrl: resolved.sourceUrl,
  };
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

  const hits = llmAvailable()
    ? await findRetailerHits(query).catch(() => [] as RetailerHit[])
    : [];

  const destinations: Dest[] = [];
  const usedHosts = new Set<string>();
  for (const hit of hits) {
    if (destinations.length >= limit) break;
    try {
      const host = new URL(hit.url).hostname.replace(/^www\./, "");
      if (usedHosts.has(host)) continue;
      usedHosts.add(host);
      destinations.push({ name: hit.retailer || host, url: hit.url, hit });
    } catch {
      /* skip */
    }
  }
  for (const shop of pickRetailers(query, limit)) {
    if (destinations.length >= limit) break;
    try {
      const host = new URL(shop.searchUrl(query)).hostname.replace(/^www\./, "");
      if (usedHosts.has(host)) continue;
      usedHosts.add(host);
      destinations.push({ name: shop.name, url: shop.searchUrl(query) });
    } catch {
      /* skip */
    }
  }

  const cdnPool = await poolRetailerCdnHits(query, garment);
  const products = (
    await Promise.all(
      destinations.slice(0, limit).map((d) =>
        scrapeDestination(d, intent, garment, query, cdnPool).catch(() => null),
      ),
    )
  ).filter((p): p is Product => p !== null);

  const imagesKept = products.filter((p) => p.imageUrl).length;
  lastMeta = {
    providers: ["retailer-page"],
    openaiHits: hits.length,
    model: llmAvailable() ? currentModel() : null,
    pagesFetched: destinations.length,
    imagesKept,
  };
  const out = products.length > 0 ? products : buildLocalShopProducts(intent, limit);
  if (out.length > 0) remember(cacheKey, out);
  return out.slice(0, limit);
}

/**
 * Sync fallback so a clothing ask never returns zero cards when scrapes fail.
 * Link goes to a real retailer search page; image may be absent (swatch).
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
