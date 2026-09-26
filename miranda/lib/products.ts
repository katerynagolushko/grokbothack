import type { Product } from "./types";

/**
 * ~16 products across two stores. Several fail on purpose
 * (polyester, over budget, wrong size, logo).
 */
export const PRODUCTS: Product[] = [
  // --- Runway (editorial / high street polish) ---
  {
    id: "rw-01",
    store: "runway",
    title: "Wool Crop Blazer",
    priceGbp: 72,
    fabric: "wool",
    size: "8",
    aesthetic: ["tailored", "structured", "monochrome"],
    colour: "#1a1a1a",
    sellerPitch: "Sharp shoulders. Goes with everything.",
  },
  {
    id: "rw-02",
    store: "runway",
    title: "Pleated Midi Skirt",
    priceGbp: 58,
    fabric: "viscose",
    size: "8",
    aesthetic: ["tailored", "minimal"],
    colour: "#3d2c29",
    sellerPitch: "Office to dinner without thinking.",
  },
  {
    id: "rw-03",
    store: "runway",
    title: "Logo Statement Tee",
    priceGbp: 32,
    fabric: "cotton",
    size: "8",
    aesthetic: ["casual", "loud"],
    colour: "#f0e6d8",
    sellerPitch: "Our bestselling graphic. Everyone has one.",
  },
  {
    id: "rw-04",
    store: "runway",
    title: "Satin Slip Dress",
    priceGbp: 95,
    fabric: "polyester",
    size: "8",
    aesthetic: ["evening", "glossy"],
    colour: "#8b2942",
    sellerPitch: "Liquid shine for Friday night.",
  },
  {
    id: "rw-05",
    store: "runway",
    title: "High-Waist Trousers",
    priceGbp: 68,
    fabric: "wool blend",
    size: "8",
    aesthetic: ["tailored", "sharp", "structured"],
    colour: "#2c2c2c",
    sellerPitch: "Crease that holds. Proper trousers.",
  },
  {
    id: "rw-06",
    store: "runway",
    title: "Oversized Hoodie",
    priceGbp: 45,
    fabric: "cotton",
    size: "12",
    aesthetic: ["casual", "sporty"],
    colour: "#6b7c85",
    sellerPitch: "Cosy. One size up for the drop.",
  },
  {
    id: "rw-07",
    store: "runway",
    title: "Column Knit Dress",
    priceGbp: 78,
    fabric: "merino",
    size: "8",
    aesthetic: ["minimal", "monochrome", "structured"],
    colour: "#c4b7a6",
    sellerPitch: "Clean line. No effort required.",
  },
  {
    id: "rw-08",
    store: "runway",
    title: "Party Sequin Top",
    priceGbp: 110,
    fabric: "polyester",
    size: "10",
    aesthetic: ["party", "loud"],
    colour: "#c9a227",
    sellerPitch: "Catch the light. Catch the room.",
  },

  // --- Archive (secondhand / warehouse feel) ---
  {
    id: "ar-01",
    store: "archive",
    title: "Vintage Tweed Jacket",
    priceGbp: 64,
    fabric: "wool tweed",
    size: "8",
    aesthetic: ["tailored", "structured", "heritage"],
    colour: "#5c4a3a",
    sellerPitch: "1990s Savile Row offcut energy.",
  },
  {
    id: "ar-02",
    store: "archive",
    title: "Deadstock Silk Shirt",
    priceGbp: 55,
    fabric: "silk",
    size: "8",
    aesthetic: ["minimal", "sharp", "monochrome"],
    colour: "#ebe4d8",
    sellerPitch: "Never worn. Still has the pin.",
  },
  {
    id: "ar-03",
    store: "archive",
    title: "Poly Track Jacket",
    priceGbp: 28,
    fabric: "polyester",
    size: "8",
    aesthetic: ["sporty", "casual"],
    colour: "#1e4d3a",
    sellerPitch: "Y2K revival. Soft shell.",
  },
  {
    id: "ar-04",
    store: "archive",
    title: "Tailored Cigarette Pants",
    priceGbp: 48,
    fabric: "cotton twill",
    size: "8",
    aesthetic: ["tailored", "minimal", "sharp"],
    colour: "#222222",
    sellerPitch: "Narrow leg. No nonsense.",
  },
  {
    id: "ar-05",
    store: "archive",
    title: "Designer Logo Sweat",
    priceGbp: 75,
    fabric: "cotton",
    size: "8",
    aesthetic: ["casual", "loud", "logo"],
    colour: "#d9d9d9",
    sellerPitch: "Big logo. Bigger flex.",
  },
  {
    id: "ar-06",
    store: "archive",
    title: "Cashmere Crew",
    priceGbp: 120,
    fabric: "cashmere",
    size: "8",
    aesthetic: ["minimal", "monochrome"],
    colour: "#8a7f72",
    sellerPitch: "Proper cashmere. Worth it.",
  },
  {
    id: "ar-07",
    store: "archive",
    title: "Structured Shift Dress",
    priceGbp: 70,
    fabric: "linen",
    size: "8",
    aesthetic: ["tailored", "structured", "minimal"],
    colour: "#4a5560",
    sellerPitch: "Boxy. Architectural. Done.",
  },
  {
    id: "ar-08",
    store: "archive",
    title: "Wide Cargo Trousers",
    priceGbp: 42,
    fabric: "cotton",
    size: "14",
    aesthetic: ["utility", "casual"],
    colour: "#6e5b4a",
    sellerPitch: "Pockets for days. Size runs large.",
  },
];

/** Product stills in `public/products/{id}.jpg`. Missing ids keep the colour swatch. */
const PRODUCT_IMAGE_IDS = new Set([
  "rw-01",
  "rw-02",
  "rw-03",
  "rw-04",
  "rw-05",
  "rw-06",
  "rw-07",
  "rw-08",
  "ar-01",
  "ar-02",
  "ar-03",
  "ar-04",
  "ar-05",
  "ar-06",
  "ar-07",
  "ar-08",
]);

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getStoreProducts(store: Product["store"]): Product[] {
  return PRODUCTS.filter((p) => p.store === store);
}

export function productImageSrc(product: Product): string | undefined {
  if (product.imageUrl) return product.imageUrl;
  return PRODUCT_IMAGE_IDS.has(product.id)
    ? `/products/${product.id}.jpg`
    : undefined;
}

export function productPath(product: Product, miranda = false): string {
  if (product.source === "web" && product.sourceUrl) return product.sourceUrl;
  const base = `/shop/${product.store}/${product.id}`;
  return miranda ? `${base}?miranda=1` : base;
}
