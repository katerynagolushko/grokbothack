import { isDemoBlazerQuery } from "./demoCatalogue";
import { garmentSearchTerms, parseIntent, type GarmentKind } from "./intent";
import type { JourneyStop } from "./types";

/** Enough of a stop to recognise "the 2nd one" or "the mango". */
export type Pickable = {
  id: string;
  title: string;
  href: string;
  store?: string;
};

const POS = [
  "Zero",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
];

const OF = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

/** Title / URL words that are not a retailer. */
const STOPWORDS = new Set([
  "black",
  "white",
  "blue",
  "navy",
  "grey",
  "gray",
  "beige",
  "brown",
  "green",
  "red",
  "pink",
  "blazer",
  "blazers",
  "jacket",
  "jackets",
  "coat",
  "dress",
  "shirt",
  "trousers",
  "pants",
  "jeans",
  "skirt",
  "hoodie",
  "design",
  "tailored",
  "relaxed",
  "fitted",
  "double",
  "breasted",
  "london",
  "https",
  "http",
  "www",
  "com",
  "html",
  "product",
  "products",
  "shop",
  "variant",
  "prd",
]);

const BRANDS: { alias: string; test: RegExp }[] = [
  { alias: "asos", test: /asos/i },
  { alias: "wilson carter", test: /wilson\s*carter/i },
  { alias: "wilson", test: /wilson/i },
  { alias: "charlotte", test: /charlotte/i },
  { alias: "nobody's child", test: /nobody'?s?\s*child/i },
  { alias: "nobodys child", test: /nobody'?s?\s*child/i },
  { alias: "nobody", test: /nobody/i },
  { alias: "mango", test: /mango/i },
  { alias: "zara", test: /zara/i },
  { alias: "h&m", test: /h\s*&\s*m|\bhm\.com/i },
  { alias: "hm", test: /h\s*&\s*m|\bhm\.com/i },
  { alias: "cos", test: /cos\.com|(?:^|[^a-z])cos(?:[^a-z]|$)/i },
];

function mentions(text: string, alias: string): boolean {
  if (alias === "h&m") return /h\s*&\s*m/i.test(text);
  const escaped = alias
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/'/g, "['’]?");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(text);
}

function aliasesFor(stop: Pickable): string[] {
  const blob = `${stop.id} ${stop.title} ${stop.href} ${stop.store ?? ""}`;
  const out: string[] = [];
  for (const brand of BRANDS) {
    if (brand.test.test(blob) && !out.includes(brand.alias)) out.push(brand.alias);
  }
  const words = blob.toLowerCase().match(/[a-z][a-z0-9]{3,}/g) ?? [];
  for (const word of words) {
    if (STOPWORDS.has(word) || out.includes(word)) continue;
    out.push(word);
  }
  return out;
}

function titleHasGarment(title: string, kind: GarmentKind): boolean {
  return garmentSearchTerms(kind).some((term) => mentions(title, term));
}

/**
 * 0-based index of the stop this message picks, or null.
 * Ordinal ("2nd", "the second", "#2", "number 2", "first", "last") wins.
 * A retailer name ("the mango", "get me the asos") wins when it names one stop.
 * A fresh "black blazer" search is never a name-pick.
 */
export function matchStopPick(text: string, stops: Pickable[]): number | null {
  const trimmed = text.trim();
  if (!trimmed || stops.length === 0) return null;

  const ordinal = ordinalIndex(trimmed, stops.length);
  if (ordinal != null) return ordinal;

  if (isDemoBlazerQuery(trimmed)) return null;

  const hits: number[] = [];
  for (let i = 0; i < stops.length; i++) {
    if (aliasesFor(stops[i]).some((alias) => mentions(trimmed, alias))) hits.push(i);
  }
  if (hits.length !== 1) return null;

  const intent = parseIntent(trimmed);
  if (intent.garments.length === 0) return hits[0];
  if (!/\b(get|gimme|give|take|want|wanna|grab|buy|choose|pick|i['’]?ll|i will)\b/i.test(trimmed)) {
    return null;
  }
  const title = stops[hits[0]].title;
  if (!intent.garments.every((g) => titleHasGarment(title, g))) return null;
  return hits[0];
}

function ordinalIndex(text: string, count: number): number | null {
  const lower = text.toLowerCase();
  const found: { at: number; n: number }[] = [];
  const words: Record<string, number | "last"> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    last: "last",
    final: "last",
  };

  const patterns: RegExp[] = [
    /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|last|final)\b/g,
    /#\s*(\d+)/g,
    /\b(?:number|no\.?|num)\s*(\d+)\b/g,
    /\b(\d+)(?:st|nd|rd|th)\b/g,
  ];

  for (const re of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(lower))) {
      const token = m[1];
      const spec = words[token];
      const n = spec === "last" ? count : spec ?? Number(token);
      found.push({ at: m.index, n });
    }
  }

  if (found.length === 0) return null;
  found.sort((a, b) => a.at - b.at);
  const n = found[0].n;
  if (!Number.isInteger(n) || n < 1 || n > count) return null;
  return n - 1;
}

/** Short retailer name for a confirmation line. */
export function listingLabel(stop: Pickable): string {
  const hay = `${stop.href} ${stop.title} ${stop.id}`.toLowerCase();
  if (hay.includes("asos")) return "ASOS";
  if (hay.includes("wilson")) return "Wilson Carter";
  if (hay.includes("nobody")) return "Nobody's Child";
  if (hay.includes("mango")) return "Mango";
  if (hay.includes("zara")) return "Zara";
  if (hay.includes("hm.com") || hay.includes("h&m")) return "H&M";
  if (hay.includes("cos.com") || /(?:^|[^a-z])cos(?:[^a-z]|$)/.test(hay)) return "COS";
  const word = stop.title.split(/\s+/).find((w) => w.length > 2);
  return word ?? "That one";
}

/** "Second of four. Wilson Carter." */
export function pickConfirmLine(
  index: number,
  total: number,
  label: string,
  text: string,
): string {
  const last = /\b(last|final)\b/i.test(text) && index === total - 1;
  const which = last ? "Last" : (POS[index + 1] ?? `Number ${index + 1}`);
  const of = OF[total] ?? String(total);
  return `${which} of ${of}. ${label}.`;
}

export function applyPick(
  want: string,
  prior: JourneyStop[],
): { index: number; stops: JourneyStop[]; opener: string } | null {
  const index = matchStopPick(
    want,
    prior.map((s) => ({
      id: s.product.id,
      title: s.product.title,
      href: s.href,
      store: s.product.store,
    })),
  );
  if (index == null) return null;
  const stop = prior[index];
  const label = listingLabel({
    id: stop.product.id,
    title: stop.product.title,
    href: stop.href,
    store: stop.product.store,
  });
  return {
    index,
    stops: [stop],
    opener: pickConfirmLine(index, prior.length, label, want),
  };
}
