import type { GarmentKind, Product } from "./types";

export type { GarmentKind } from "./types";

export type QueryIntent = {
  garments: GarmentKind[];
  colours: string[];
  /** Fabric words the shopper typed ("wool", "silk"). */
  fabrics: string[];
  maxBudgetGbp: number | null;
};

/** Title / query keywords → garment. Order matters: more specific first. */
const DEFS: { kind: GarmentKind; keywords: string[] }[] = [
  { kind: "blazer", keywords: ["blazer", "blazers", "suit jacket", "sport coat"] },
  { kind: "cardigan", keywords: ["cardigan", "cardi"] },
  { kind: "hoodie", keywords: ["hoodie", "hoody", "hooded"] },
  { kind: "sweat", keywords: ["sweatshirt", "sweat", "crewneck sweat"] },
  {
    kind: "knit",
    keywords: ["knit", "jumper", "sweater", "pullover", "cashmere", "merino", "crew"],
  },
  { kind: "coat", keywords: ["coat", "overcoat", "trench", "parka", "mac"] },
  { kind: "jacket", keywords: ["jacket", "bomber", "puffer", "gilet"] },
  { kind: "jeans", keywords: ["jeans", "jean", "denim trousers"] },
  {
    kind: "trousers",
    keywords: ["trouser", "trousers", "pants", "pant", "cargo", "chinos", "chino", "slacks", "joggers", "cigarette"],
  },
  { kind: "skirt", keywords: ["skirt", "skirts", "midi", "mini skirt"] },
  { kind: "dress", keywords: ["dress", "dresses", "gown", "frock"] },
  { kind: "tee", keywords: ["tee", "tees", "t-shirt", "tshirt", "t shirt", "t-shirts", "tshirts"] },
  { kind: "shirt", keywords: ["shirt", "shirts", "blouse", "button-down", "button down", "oxford"] },
  { kind: "top", keywords: ["top", "tops", "vest", "cami", "camisole"] },
];

/**
 * Soft siblings only when the ask is broader than one SKU name.
 * "Blazer" stays blazer-only — never pad with jackets/trousers.
 */
const GARMENT_EXPAND: Partial<Record<GarmentKind, GarmentKind[]>> = {
  blazer: ["blazer"],
  jacket: ["jacket", "blazer"],
  coat: ["coat"],
  tee: ["tee"],
  top: ["top", "tee", "shirt"],
  sweat: ["sweat", "hoodie"],
  hoodie: ["hoodie", "sweat"],
  knit: ["knit", "cardigan"],
  cardigan: ["cardigan", "knit"],
  trousers: ["trousers", "jeans"],
  jeans: ["jeans"],
  shirt: ["shirt"],
};

const COLOUR_KEYWORDS: { name: string; aliases: string[] }[] = [
  { name: "black", aliases: ["black", "noir", "charcoal", "ink", "jet"] },
  { name: "white", aliases: ["white", "ivory", "cream", "off-white", "ecru"] },
  { name: "red", aliases: ["red", "burgundy", "wine", "crimson", "scarlet", "maroon"] },
  { name: "blue", aliases: ["blue", "navy", "cobalt", "denim", "chambray", "indigo"] },
  { name: "navy", aliases: ["navy"] },
  { name: "green", aliases: ["green", "olive", "khaki", "sage", "emerald", "forest"] },
  { name: "brown", aliases: ["brown", "tan", "chocolate", "tweed"] },
  { name: "camel", aliases: ["camel", "caramel", "toffee"] },
  { name: "grey", aliases: ["grey", "gray", "silver", "marl"] },
  { name: "gold", aliases: ["gold", "sequin", "mustard"] },
  { name: "beige", aliases: ["beige", "taupe", "sand", "stone", "oat", "oatmeal", "nude"] },
  { name: "pink", aliases: ["pink", "blush", "rose", "dusty pink"] },
  { name: "purple", aliases: ["purple", "plum", "aubergine", "lilac", "violet"] },
  { name: "yellow", aliases: ["yellow", "lemon"] },
  { name: "striped", aliases: ["striped", "stripe", "stripes", "breton"] },
  { name: "floral", aliases: ["floral", "flower", "flowers", "printed"] },
];

/** Colour family kinship so "blue blazer" still ranks a navy one. */
const COLOUR_KIN: Record<string, string[]> = {
  blue: ["navy"],
  navy: ["blue"],
  brown: ["camel", "beige"],
  camel: ["beige", "brown"],
  beige: ["camel", "white"],
  grey: ["black"],
  white: ["beige"],
};

const FABRIC_WORDS = [
  "wool",
  "cotton",
  "silk",
  "linen",
  "polyester",
  "cashmere",
  "merino",
  "leather",
  "denim",
  "viscose",
  "satin",
  "tweed",
  "velvet",
];

/** Map catalogue hex swatches to named colours. */
function colourFromHex(hex: string): string[] {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length !== 6) return [];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const sat = max === 0 ? 0 : (max - min) / max;

  const names: string[] = [];
  if (lum < 0.18 && sat < 0.35) names.push("black");
  else if (lum > 0.85 && sat < 0.25) names.push("white");
  else if (sat < 0.15) {
    if (lum < 0.45) names.push("grey", "black");
    else names.push("grey", "beige");
  } else if (r > g + 20 && r > b + 20) {
    if (lum < 0.45) names.push("brown", "red");
    else if (g > 100) names.push("gold", "beige");
    else names.push("red");
  } else if (g > r && g > b) names.push("green");
  else if (b > r && b >= g) names.push("blue", "grey");
  else if (r > 150 && g > 100 && b < 80) names.push("gold", "beige");
  else if (lum > 0.55 && sat < 0.35) names.push("beige", "white");
  else if (lum < 0.35) names.push("brown", "black");

  return names;
}

function wordBoundaryIncludes(hay: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, "i").test(hay);
}

/** Soft clothing nouns that are not a specific garment family. */
const CLOTHING_SOFT =
  /\b(clothes|clothing|outfit|outfits|wear|wardrobe|piece|pieces|garment|garments)\b/i;

/**
 * True when the shopper is asking for clothes (not "hi" / "who are you").
 * Garment keyword, soft clothing word, or colour plus a clothing-ish noun.
 */
export function looksLikeClothingAsk(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const intent = parseIntent(trimmed);
  if (intent.garments.length > 0) return true;
  if (CLOTHING_SOFT.test(trimmed)) return true;
  return false;
}

export function parseIntent(text: string): QueryIntent {
  const lower = text.toLowerCase();

  const garments: GarmentKind[] = [];
  for (const def of DEFS) {
    if (def.keywords.some((k) => wordBoundaryIncludes(lower, k))) {
      if (!garments.includes(def.kind)) garments.push(def.kind);
    }
  }
  // "t shirt" also trips "shirt"; "suit jacket" trips "jacket". Keep the specific one.
  if (garments.includes("tee") && garments.includes("shirt")) {
    if (!/\b(a|the|and|,)\s+shirt/.test(lower)) {
      garments.splice(garments.indexOf("shirt"), 1);
    }
  }
  if (garments.includes("blazer") && garments.includes("jacket") && /suit jacket/.test(lower)) {
    garments.splice(garments.indexOf("jacket"), 1);
  }
  // "denim" is a fabric/colour word, not a garment, unless "jeans"/"denim jacket" etc.
  if (garments.includes("jeans") && garments.includes("trousers") && !/\btrouser|pants/.test(lower)) {
    garments.splice(garments.indexOf("trousers"), 1);
  }

  const colours: string[] = [];
  for (const c of COLOUR_KEYWORDS) {
    if (c.aliases.some((a) => wordBoundaryIncludes(lower, a))) {
      if (!colours.includes(c.name)) colours.push(c.name);
    }
  }
  // "navy" is both blue and navy; keep "navy" first so titles win.
  if (colours.includes("navy") && colours.includes("blue") && !/\bblue\b/.test(lower)) {
    colours.splice(colours.indexOf("blue"), 1);
  }

  const fabrics = FABRIC_WORDS.filter((f) => wordBoundaryIncludes(lower, f));

  let maxBudgetGbp: number | null = null;
  const under = lower.match(
    /(?:under|below|max|upto|up to|less than|<)\s*£?\s*(\d+)/,
  );
  const pound = lower.match(/£\s*(\d+)/);
  if (under) maxBudgetGbp = Number(under[1]);
  else if (pound && /\b(under|below|max|budget|less)\b/.test(lower)) {
    maxBudgetGbp = Number(pound[1]);
  }

  return { garments, colours, fabrics, maxBudgetGbp };
}

/** Garment word to use in a web image search or a Miranda line. */
export function garmentWord(kind: GarmentKind): string {
  switch (kind) {
    case "tee":
      return "t-shirt";
    case "sweat":
      return "sweatshirt";
    case "knit":
      return "jumper";
    default:
      return kind;
  }
}

/** Words that must appear in a web photo's title/tags for it to count as this garment. */
export function garmentSearchTerms(kind: GarmentKind): string[] {
  const def = DEFS.find((d) => d.kind === kind);
  const base = def ? [...def.keywords] : [kind];
  if (kind === "tee") base.push("tee shirt", "tshirt", "t-shirt");
  if (kind === "knit") base.push("knitwear");
  return base;
}

export function productGarmentKinds(product: Product): GarmentKind[] {
  if (product.category) return [product.category];
  const title = product.title.toLowerCase();
  const kinds: GarmentKind[] = [];
  for (const def of DEFS) {
    if (def.keywords.some((k) => wordBoundaryIncludes(title, k))) {
      kinds.push(def.kind);
    }
  }
  return kinds;
}

function expandedGarments(requested: GarmentKind[]): Set<GarmentKind> {
  const out = new Set<GarmentKind>();
  for (const g of requested) {
    const expand = GARMENT_EXPAND[g] ?? [g];
    for (const e of expand) out.add(e);
  }
  return out;
}

/** Strict garment filter: product must be in the requested family. */
export function matchesGarmentIntent(
  product: Product,
  intent: QueryIntent,
): boolean {
  if (intent.garments.length === 0) return true;
  const allowed = expandedGarments(intent.garments);
  const kinds = productGarmentKinds(product);
  return kinds.some((k) => allowed.has(k));
}

/** Exact garment hit (e.g. blazer vs jacket sibling) scores higher. */
export function garmentMatchScore(
  product: Product,
  intent: QueryIntent,
): number {
  if (intent.garments.length === 0) return 0;
  const kinds = productGarmentKinds(product);
  let score = 0;
  for (const g of intent.garments) {
    if (kinds.includes(g)) score += 10;
    else if ((GARMENT_EXPAND[g] ?? []).some((e) => kinds.includes(e))) {
      score += 4;
    }
  }
  return score;
}

/** Named colours a product answers to: explicit colourName, title words, hex. */
export function productColours(product: Product): string[] {
  const out = new Set<string>();
  const hay = `${product.colourName ?? ""} ${product.title}`.toLowerCase();
  for (const c of COLOUR_KEYWORDS) {
    if (c.aliases.some((a) => wordBoundaryIncludes(hay, a))) out.add(c.name);
  }
  if (out.size === 0) {
    for (const c of colourFromHex(product.colour)) out.add(c);
  }
  return [...out];
}

export function colourMatchScore(
  product: Product,
  intent: QueryIntent,
): number {
  if (intent.colours.length === 0) return 0;
  const have = productColours(product);
  let score = 0;
  for (const c of intent.colours) {
    if (have.includes(c)) score += 10;
    else if ((COLOUR_KIN[c] ?? []).some((k) => have.includes(k))) score += 4;
  }
  return score;
}

/** True when the product is the asked colour (or a close kin). No colour asked → true. */
export function matchesColourIntent(
  product: Product,
  intent: QueryIntent,
): boolean {
  if (intent.colours.length === 0) return true;
  return colourMatchScore(product, intent) > 0;
}

export function budgetMatchScore(
  product: Product,
  intent: QueryIntent,
): number {
  if (intent.maxBudgetGbp == null) return 0;
  if (product.priceGbp <= intent.maxBudgetGbp) return 3;
  return -8;
}

/**
 * Ranking score for intent: garment first, colour second, budget third.
 */
export function intentScore(product: Product, intent: QueryIntent): number {
  return (
    garmentMatchScore(product, intent) +
    colourMatchScore(product, intent) +
    budgetMatchScore(product, intent)
  );
}
