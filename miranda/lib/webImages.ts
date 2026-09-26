import crypto from "node:crypto";
import {
  garmentSearchTerms,
  garmentWord,
  type GarmentKind,
  type QueryIntent,
} from "./intent";
import type { Product } from "./types";

/**
 * Layer 2: live image search. When the curated catalogue is thin for a
 * garment + colour, pull real photos from a stock API and synthesise
 * "web" products so Miranda still shows the right garment.
 *
 * Order: Pexels (if PEXELS_API_KEY) → Openverse (keyless) → Wikimedia Commons (keyless).
 * Never throws. Empty array on any failure.
 */

const TIMEOUT_MS = 4000;
const UA = "MirandaDemo/1.0 (+https://github.com/minthantkyaw28/grokbothack)";

type WebPhoto = {
  /** Stable id source (provider photo id). */
  key: string;
  imageUrl: string;
  sourceUrl: string;
  title: string;
  tags: string[];
  width: number;
  height: number;
  provider: "pexels" | "openverse" | "wikimedia";
};

const cache = new Map<string, Product[]>();
const CACHE_MAX = 200;

function remember(key: string, value: Product[]) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json", ...headers },
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

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

async function searchPexels(query: string, key: string): Promise<WebPhoto[]> {
  const url =
    "https://api.pexels.com/v1/search?" +
    new URLSearchParams({ query, per_page: "8", orientation: "portrait" });
  const data = (await fetchJson(url, { Authorization: key })) as {
    photos?: Array<{
      id: number;
      width: number;
      height: number;
      url: string;
      alt?: string;
      src: { large: string; portrait: string };
    }>;
  } | null;
  if (!data?.photos) return [];
  return data.photos.map((p) => ({
    key: `pexels-${p.id}`,
    imageUrl: p.src.large ?? p.src.portrait,
    sourceUrl: p.url,
    title: p.alt ?? query,
    tags: [],
    width: p.width,
    height: p.height,
    provider: "pexels" as const,
  }));
}

/** Wikimedia originals can be 20 MB. Ask for a 1024px rendition instead. */
function wikimediaThumb(url: string, px = 1024): string {
  const m = url.match(
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w)\/(\w\w)\/([^/?]+)$/,
  );
  if (!m) return url;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/${px}px-${m[3]}`;
}

async function searchOpenverse(query: string): Promise<WebPhoto[]> {
  const url =
    "https://api.openverse.org/v1/images/?" +
    new URLSearchParams({
      q: query,
      license_type: "commercial",
      page_size: "20",
      aspect_ratio: "tall",
      mature: "false",
    });
  const data = (await fetchJson(url)) as {
    results?: Array<{
      id: string;
      title?: string | null;
      url: string;
      foreign_landing_url?: string;
      tags?: Array<{ name: string }> | null;
      width?: number | null;
      height?: number | null;
      provider?: string;
      filetype?: string | null;
    }>;
  } | null;
  if (!data?.results) return [];
  return data.results
    .filter((r) => /\.(jpe?g|png|webp)(\?|$)/i.test(r.url) || !r.filetype || /jpe?g|png/i.test(r.filetype))
    .map((r) => ({
      key: `ov-${r.id}`,
      imageUrl: r.url.includes("upload.wikimedia.org") ? wikimediaThumb(r.url) : r.url,
      sourceUrl: r.foreign_landing_url ?? r.url,
      title: r.title ?? "",
      tags: (r.tags ?? []).map((t) => t.name),
      width: r.width ?? 0,
      height: r.height ?? 0,
      provider: "openverse" as const,
    }));
}

async function searchWikimedia(query: string): Promise<WebPhoto[]> {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "15",
      prop: "imageinfo",
      iiprop: "url|size|mime",
      iiurlwidth: "1024",
      format: "json",
      origin: "*",
    });
  const data = (await fetchJson(url)) as {
    query?: {
      pages?: Record<
        string,
        {
          pageid: number;
          title: string;
          imageinfo?: Array<{
            url: string;
            thumburl?: string;
            descriptionurl?: string;
            width: number;
            height: number;
            mime: string;
          }>;
        }
      >;
    };
  } | null;
  const pages = data?.query?.pages;
  if (!pages) return [];
  return Object.values(pages)
    .filter((p) => p.imageinfo?.[0] && /^image\/(jpeg|png|webp)$/.test(p.imageinfo[0].mime))
    .map((p) => {
      const ii = p.imageinfo![0];
      const thumb = (ii.thumburl ?? ii.url).split("?")[0];
      return {
        key: `wm-${p.pageid}`,
        imageUrl: thumb,
        sourceUrl: ii.descriptionurl ?? `https://commons.wikimedia.org/?curid=${p.pageid}`,
        title: p.title.replace(/^File:/, "").replace(/\.\w+$/, ""),
        tags: [],
        width: ii.width,
        height: ii.height,
        provider: "wikimedia" as const,
      };
    });
}

// ---------------------------------------------------------------------------
// Filtering + synthesis
// ---------------------------------------------------------------------------

const REJECT = /\b(kanzu|uniform|child|children|kid|kids|toddler|baby|doll|cosplay|mannequin|pattern|sewing|drawing|illustration|painting|logo|icon|clipart|diagram|map)\b/i;

function looksLikeGarment(photo: WebPhoto, garment: GarmentKind): boolean {
  const hay = `${photo.title} ${photo.tags.join(" ")}`.toLowerCase();
  if (REJECT.test(hay)) return false;
  return garmentSearchTerms(garment).some((t) => hay.includes(t.toLowerCase()));
}

function hash8(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);
}

function inferFabric(intent: QueryIntent): string {
  return intent.fabrics[0] ?? "unlisted";
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

/** Deterministic price from hash: £35–£104. Stable across runs for the same photo. */
function priceFor(key: string, budgetHint: number | null): number {
  const n = parseInt(hash8(key), 16);
  const span = 70;
  const base = budgetHint ? Math.max(20, Math.round(budgetHint * 0.55)) : 35;
  return base + (n % span);
}

function synthesise(photo: WebPhoto, intent: QueryIntent, garment: GarmentKind): Product {
  const colour = intent.colours[0];
  const fabric = intent.fabrics[0];
  const title = titleCase(
    [colour, fabric, garmentWord(garment)].filter(Boolean).join(" "),
  );
  const id = `ext-${hash8(photo.key)}`;
  return {
    id,
    store: "web",
    title,
    priceGbp: priceFor(photo.key, intent.maxBudgetGbp),
    fabric: inferFabric(intent),
    size: "8",
    aesthetic: aestheticFor(garment),
    colour: "#444444",
    colourName: colour,
    category: garment,
    sellerPitch: photo.title.slice(0, 80) || "Seen on the wider web.",
    imageUrl: photo.imageUrl,
    source: "web",
    sourceUrl: photo.sourceUrl,
  };
}

function buildQuery(intent: QueryIntent, garment: GarmentKind): string {
  const bits: string[] = [];
  if (intent.colours[0]) bits.push(intent.colours[0]);
  if (intent.fabrics[0]) bits.push(intent.fabrics[0]);
  bits.push(garmentWord(garment));
  return bits.join(" ");
}

function rankPhotos(photos: WebPhoto[], garment: GarmentKind, colour?: string): WebPhoto[] {
  const seen = new Set<string>();
  return photos
    .filter((p) => {
      if (seen.has(p.imageUrl)) return false;
      seen.add(p.imageUrl);
      return looksLikeGarment(p, garment);
    })
    .map((p) => {
      let score = 0;
      if (p.height > p.width) score += 3; // portrait
      if (colour && `${p.title} ${p.tags.join(" ")}`.toLowerCase().includes(colour)) score += 4;
      if (p.height >= 600) score += 1;
      if (p.provider === "pexels") score += 2;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

/**
 * Find up to `limit` web products for the first garment in the intent.
 * Cached per normalised query for the life of the server instance.
 */
export async function searchWebProducts(
  intent: QueryIntent,
  limit = 3,
): Promise<Product[]> {
  const garment = intent.garments[0];
  if (!garment) return [];
  const query = buildQuery(intent, garment);
  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  const colour = intent.colours[0];
  let photos: WebPhoto[] = [];

  const pexelsKey = process.env.PEXELS_API_KEY?.trim();
  if (pexelsKey) {
    photos = rankPhotos(await searchPexels(query, pexelsKey), garment, colour);
    // Pexels alt text is sparse; if title filter killed everything, trust the query.
    if (photos.length === 0) {
      const raw = await searchPexels(query, pexelsKey);
      photos = raw.filter((p) => !REJECT.test(p.title)).slice(0, limit);
    }
  }
  if (photos.length < limit) {
    const more = rankPhotos(await searchOpenverse(query), garment, colour);
    photos = [...photos, ...more];
  }
  if (photos.length < limit) {
    const more = rankPhotos(await searchWikimedia(query), garment, colour);
    photos = [...photos, ...more];
  }

  const products = photos.slice(0, Math.max(limit, 3)).map((p) => synthesise(p, intent, garment));
  if (products.length > 0) remember(cacheKey, products);
  return products.slice(0, limit);
}

/** Test hook. */
export function resetWebImageCacheForTests() {
  cache.clear();
}
