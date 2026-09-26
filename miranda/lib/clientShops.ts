import {
  garmentWord,
  looksLikeClothingAsk,
  parseIntent,
  withInferredGarments,
  type GarmentKind,
} from "./intent";

/** Browser-safe shop search cards when /api/journey is empty or too slow. */
export type ClientShopCard = {
  id: string;
  store: string;
  title: string;
  priceGbp: number;
  href: string;
  colour: string;
  colourName?: string;
  because: string;
};

const SHOPS: { name: string; searchUrl: (q: string) => string }[] = [
  {
    name: "ASOS",
    searchUrl: (q) => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
  },
  {
    name: "Mango",
    searchUrl: (q) => `https://shop.mango.com/gb/search?kw=${encodeURIComponent(q)}`,
  },
  {
    name: "H&M",
    searchUrl: (q) =>
      `https://www2.hm.com/en_gb/search-results.html?q=${encodeURIComponent(q)}`,
  },
];

const HEX: Record<string, string> = {
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

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function priceUnder(key: string, budget: number | null): number {
  const n = hash(key);
  if (budget != null && budget > 0) {
    const cap = Math.max(1, Math.floor(budget));
    const floor = Math.min(cap, Math.max(8, Math.round(cap * 0.45)));
    if (floor >= cap) return cap;
    return floor + (n % (cap - floor + 1));
  }
  return 28 + (n % 40);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Three retailer search links for a clothing ask. Empty for small talk. */
export function clientShopCards(want: string): ClientShopCard[] {
  const trimmed = want.trim();
  if (!trimmed) return [];
  const intent = withInferredGarments(trimmed, parseIntent(trimmed));
  if (intent.garments.length === 0 && !looksLikeClothingAsk(trimmed)) return [];
  const garment = (intent.garments[0] ?? "top") as GarmentKind;
  const colour = intent.colours[0];
  const query = trimmed.slice(0, 80);
  const label =
    [colour, garmentWord(garment)].filter(Boolean).map(capitalise).join(" ") ||
    capitalise(trimmed);
  const because = colour ? `${capitalise(colour)}. Wear it.` : "Wear it.";
  return SHOPS.map((shop) => {
    const href = shop.searchUrl(query);
    return {
      id: `shop-${shop.name.toLowerCase().replace(/[^a-z]/g, "")}-${hash(href).toString(16)}`,
      store: shop.name,
      title: `${shop.name} ${label}`,
      priceGbp: priceUnder(href, intent.maxBudgetGbp),
      href,
      colour: HEX[colour ?? ""] ?? "#444444",
      colourName: colour,
      because,
    };
  });
}
