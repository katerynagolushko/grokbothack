import type { Product } from "./types";

/**
 * Locked demo catalogue for the recommendation journey (home chat + WhatsApp).
 * Exactly these four live retailer black blazers. No old shop SKUs. No stock photos.
 */
export const DEMO_BLAZERS: Product[] = [
  {
    id: "asos-blazer",
    store: "web",
    title: "ASOS DESIGN tailored relaxed blazer in black",
    priceGbp: 35,
    fabric: "polyester",
    size: "8",
    aesthetic: ["tailored", "structured", "monochrome"],
    colour: "#1a1a1a",
    colourName: "black",
    category: "blazer",
    sellerPitch: "Peak lapels. Relaxed fit.",
    imageUrl: "/products/asos-blazer.jpg",
    source: "catalogue",
    sourceUrl:
      "https://www.asos.com/asos-design/asos-design-tailored-relaxed-blazer-in-black/prd/210659385",
  },
  {
    id: "wilson-charlotte",
    store: "web",
    title: "Wilson Carter London Charlotte blazer",
    priceGbp: 29.95,
    fabric: "unlisted",
    size: "8",
    aesthetic: ["tailored", "structured", "monochrome"],
    colour: "#1a1a1a",
    colourName: "black",
    category: "blazer",
    sellerPitch: "Single-breasted. Clearance.",
    imageUrl: "/products/wilson-charlotte.jpg",
    source: "catalogue",
    sourceUrl:
      "https://www.wilsoncarter-london.com/products/charlotte-blazer?variant=64116450460017",
  },
  {
    id: "nobodys-child-blazer",
    store: "web",
    title: "Nobody's Child black double-breasted blazer",
    priceGbp: 72,
    fabric: "polyester",
    size: "8",
    aesthetic: ["tailored", "structured", "monochrome"],
    colour: "#1a1a1a",
    colourName: "black",
    category: "blazer",
    sellerPitch: "Double-breasted. Relaxed fit.",
    imageUrl: "/products/nobodys-child-blazer.jpg",
    source: "catalogue",
    sourceUrl:
      "https://www.nobodyschild.com/products/black-double-breasted-blazer-b254153blk?variant=54517412364673",
  },
  {
    id: "mango-blazer",
    store: "web",
    title: "Mango black blazer",
    priceGbp: 49.99,
    fabric: "polyester",
    size: "8",
    aesthetic: ["tailored", "structured", "monochrome"],
    colour: "#1a1a1a",
    colourName: "black",
    category: "blazer",
    sellerPitch: "Fitted suit blazer.",
    imageUrl: "/products/mango-blazer.jpg",
    source: "catalogue",
    sourceUrl: "https://shop.mango.com/gb/en/p/37085858/99/00",
  },
];

export const DEMO_BLAZER_IDS = new Set(DEMO_BLAZERS.map((p) => p.id));

export const DEMO_REFUSE = "Black blazer. Say it.";

/** black blazer / blazer / dinner blazer / black jacket. Nothing else. */
export function isDemoBlazerQuery(want: string): boolean {
  const t = want.trim().toLowerCase();
  if (!t) return false;
  if (/\bblazers?\b/.test(t)) return true;
  if (/\bblack\b/.test(t) && /\bjackets?\b/.test(t)) return true;
  return false;
}
