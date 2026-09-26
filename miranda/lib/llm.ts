/**
 * Optional OpenAI language layer. SERVER ONLY — never import from client components.
 *
 * Rules (see AGENTS.md): the demo must run with no key. Every function here
 * returns null on any failure and callers fall back to deterministic templates.
 * Verdicts are never decided here; the model only rephrases a verdict it is given.
 *
 * Model: lists /v1/models and picks smallest Luna (else cheapest mini).
 * Chat Completions with strict JSON schema. 3.5s timeout, one retry.
 */
import { parseIntent, type GarmentKind } from "./intent";
import type { Purchase } from "./profiles";
import type { Verdict } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODELS_URL = "https://api.openai.com/v1/models";
const RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.6-luna";
const TIMEOUT_MS = 3500;

/** Cached after listing: smallest Luna, else cheapest mini/nano. */
let resolvedModel: string | null = null;
let resolveInFlight: Promise<string> | null = null;

export function currentModel(): string {
  return resolvedModel ?? process.env.OPENAI_MODEL?.trim() ?? DEFAULT_MODEL;
}

function lunaScore(id: string): number {
  const m = id.match(/^gpt-(\d+(?:\.\d+)?)-luna$/i);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function pickFromList(ids: string[]): string {
  const luna = ids.filter((id) => /^gpt-[\d.]+-luna$/i.test(id));
  if (luna.length) {
    luna.sort((a, b) => lunaScore(a) - lunaScore(b) || a.length - b.length);
    return luna[0];
  }
  const cheap = ids.filter((id) =>
    /^(gpt-[\d.]+-nano|gpt-[\d.]+-mini|gpt-4o-mini)$/i.test(id),
  );
  if (cheap.length) {
    cheap.sort((a, b) => {
      const nano = Number(/nano/i.test(a)) - Number(/nano/i.test(b));
      if (nano !== 0) return -nano;
      return a.length - b.length;
    });
    return cheap[0];
  }
  return DEFAULT_MODEL;
}

async function ensureModel(): Promise<string> {
  if (resolvedModel) return resolvedModel;
  // Prefer explicit OPENAI_MODEL (e.g. gpt-5.6-luna); else smallest Luna from /v1/models.
  const envModel = process.env.OPENAI_MODEL?.trim();
  if (envModel) {
    resolvedModel = envModel;
    return envModel;
  }
  if (resolveInFlight) return resolveInFlight;
  resolveInFlight = (async () => {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) return currentModel();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    try {
      const res = await fetch(MODELS_URL, {
        headers: { Authorization: `Bearer ${key}` },
        signal: ctrl.signal,
      });
      if (!res.ok) return currentModel();
      const data = (await res.json()) as { data?: { id: string }[] };
      const picked = pickFromList((data.data ?? []).map((m) => m.id));
      resolvedModel = picked;
      console.log(`[llm] using ${picked}`);
      return picked;
    } catch {
      return currentModel();
    } finally {
      clearTimeout(timer);
    }
  })().finally(() => {
    resolveInFlight = null;
  });
  return resolveInFlight;
}

const GARMENTS: GarmentKind[] = [
  "blazer", "jacket", "coat", "trousers", "jeans", "skirt", "dress",
  "tee", "shirt", "hoodie", "sweat", "top", "knit", "cardigan",
];
const COLOURS = [
  "black", "white", "red", "blue", "navy", "green", "brown", "camel", "grey",
  "gold", "beige", "pink", "purple", "yellow", "striped", "floral",
];

export function llmAvailable(): boolean {
  if (typeof window !== "undefined") return false; // never in the browser
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

type JsonSchema = Record<string, unknown>;

async function callOnce<T>(
  system: string,
  user: string,
  schema: JsonSchema,
  maxTokens: number,
): Promise<T | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const m = await ensureModel();
  const body: Record<string, unknown> = {
    model: m,
    max_completion_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "out", strict: true, schema },
    },
  };
  // Reasoning models: switch thinking off for speed and tokens.
  if (/luna|^gpt-5|^o\d/i.test(m)) body.reasoning_effort = "none";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      // 4xx will not get better on retry; 5xx / 429 might.
      if (res.status >= 500 || res.status === 429) throw new Error(`openai ${res.status}`);
      console.warn(`[llm] ${res.status} from OpenAI (model=${m})`);
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null; refusal?: string | null } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** One retry on timeout / network / 5xx. Never throws. */
async function callJson<T>(
  system: string,
  user: string,
  schema: JsonSchema,
  maxTokens: number,
): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await callOnce<T>(system, user, schema, maxTokens);
    } catch (err) {
      if (attempt === 1) {
        console.warn(`[llm] gave up: ${err instanceof Error ? err.message : "error"}`);
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 1. Message analysis: intent + purchase report + small talk, one round trip.
// ---------------------------------------------------------------------------

export type LlmIntent = {
  garment?: GarmentKind;
  /** When the ask implies a garment but does not name one ("dinner in Soho"). */
  garmentCandidates?: GarmentKind[];
  colours?: string[];
  budgetMax?: number;
  occasion?: string;
  fabricWishes?: string[];
  fabricAvoid?: string[];
  brands?: string[];
  isShoppingAsk: boolean;
  isPurchaseReport: boolean;
  isSmallTalk: boolean;
};

type RawPurchase = {
  store: string;
  item: string;
  category: string;
  colour: string;
  price: number | null;
  returned: boolean;
  returnReason: string | null;
};

type RawAnalysis = {
  garment: string | null;
  garmentCandidates: string[];
  colours: string[];
  budgetMax: number | null;
  occasion: string | null;
  fabricWishes: string[];
  fabricAvoid: string[];
  brands: string[];
  isShoppingAsk: boolean;
  isPurchaseReport: boolean;
  isSmallTalk: boolean;
  purchase: RawPurchase | null;
};

export type MessageAnalysis = { intent: LlmIntent; purchase: Purchase | null };

const ANALYSIS_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "garment", "garmentCandidates", "colours", "budgetMax", "occasion",
    "fabricWishes", "fabricAvoid", "brands", "isShoppingAsk",
    "isPurchaseReport", "isSmallTalk", "purchase",
  ],
  properties: {
    garment: { type: ["string", "null"], enum: [...GARMENTS, null] },
    garmentCandidates: { type: "array", items: { type: "string", enum: GARMENTS } },
    colours: { type: "array", items: { type: "string", enum: COLOURS } },
    budgetMax: { type: ["number", "null"] },
    occasion: { type: ["string", "null"] },
    fabricWishes: { type: "array", items: { type: "string" } },
    fabricAvoid: { type: "array", items: { type: "string" } },
    brands: { type: "array", items: { type: "string" } },
    isShoppingAsk: { type: "boolean" },
    isPurchaseReport: { type: "boolean" },
    isSmallTalk: { type: "boolean" },
    purchase: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["store", "item", "category", "colour", "price", "returned", "returnReason"],
          properties: {
            store: { type: "string" },
            item: { type: "string" },
            category: { type: "string", enum: [...GARMENTS, "other"] },
            colour: { type: "string" },
            price: { type: ["number", "null"] },
            returned: { type: "boolean" },
            returnReason: { type: ["string", "null"] },
          },
        },
        { type: "null" },
      ],
    },
  },
};

const ANALYSIS_SYSTEM =
  "Classify one message to Miranda, a fashion stylist. UK shopper, prices in GBP. " +
  "garment: the one garment family clearly named, else null. " +
  "garmentCandidates: only when no garment is named but the ask implies one, up to 2 likely families (dinner out -> dress, blazer). " +
  "colours: map words to the allowed list (dark -> black, navy). budgetMax: number if a cap is stated. " +
  "isPurchaseReport: the shopper says they bought or returned something; then fill purchase (item as they said it, store as named, category, colour or \"\" if unknown, returned + returnReason for returns). " +
  "isSmallTalk: greeting, who are you, thanks, off-topic. isShoppingAsk: they want something to buy or wear.";

const analysisCache = new Map<string, { at: number; p: Promise<MessageAnalysis | null> }>();
const CACHE_TTL_MS = 60_000;

function firstGarment(word: string | null): GarmentKind | undefined {
  if (!word) return undefined;
  if ((GARMENTS as string[]).includes(word)) return word as GarmentKind;
  return parseIntent(word).garments[0];
}

function toAnalysis(raw: RawAnalysis): MessageAnalysis {
  const garment = firstGarment(raw.garment);
  const candidates = raw.garmentCandidates
    .map((g) => firstGarment(g))
    .filter((g): g is GarmentKind => Boolean(g))
    .slice(0, 2);
  const intent: LlmIntent = {
    garment,
    garmentCandidates: garment ? undefined : candidates.length ? candidates : undefined,
    colours: raw.colours.filter((c) => COLOURS.includes(c)),
    budgetMax: typeof raw.budgetMax === "number" && raw.budgetMax > 0 ? raw.budgetMax : undefined,
    occasion: raw.occasion ?? undefined,
    fabricWishes: raw.fabricWishes,
    fabricAvoid: raw.fabricAvoid,
    brands: raw.brands,
    isShoppingAsk: raw.isShoppingAsk,
    isPurchaseReport: raw.isPurchaseReport,
    isSmallTalk: raw.isSmallTalk,
  };
  let purchase: Purchase | null = null;
  const p = raw.purchase;
  if (raw.isPurchaseReport && p && p.item.trim()) {
    purchase = {
      store: p.store.trim() || "unknown",
      item: p.item.trim(),
      category: p.category || "other",
      colour: p.colour.trim().toLowerCase(),
      date: new Date().toISOString().slice(0, 10),
      price: typeof p.price === "number" && p.price > 0 ? p.price : 0,
      ...(p.returned ? { returned: true, returnReason: p.returnReason ?? undefined } : {}),
    };
  }
  return { intent, purchase };
}

/** One model call per distinct message (cached 60s), shared by all helpers below. */
export function analyseMessage(text: string): Promise<MessageAnalysis | null> {
  if (!llmAvailable()) return Promise.resolve(null);
  const key = text.trim().toLowerCase().slice(0, 500);
  if (!key) return Promise.resolve(null);
  const now = Date.now();
  const hit = analysisCache.get(key);
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.p;
  if (analysisCache.size > 200) analysisCache.clear();
  const p = callJson<RawAnalysis>(ANALYSIS_SYSTEM, text.slice(0, 500), ANALYSIS_SCHEMA, 200)
    .then((raw) => (raw ? toAnalysis(raw) : null))
    .catch(() => null);
  analysisCache.set(key, { at: now, p });
  return p;
}

/** Structured intent from the model; merge INTO the keyword parser (keyword wins). */
export async function parseIntentLLM(text: string): Promise<LlmIntent | null> {
  const a = await analyseMessage(text);
  return a?.intent ?? null;
}

/** "bought two pairs of wide-leg trousers at COS, black" -> Purchase; returns too. */
export async function extractPurchase(text: string): Promise<Purchase | null> {
  const a = await analyseMessage(text);
  return a?.purchase ?? null;
}

// ---------------------------------------------------------------------------
// 2. Miranda's voice. The verdict is decided in code; the model only rephrases.
// ---------------------------------------------------------------------------

const LINE_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["line"],
  properties: { line: { type: "string" } },
};

const VOICE =
  "You write one line as Miranda: cold, short, dismissive, decisive fashion editor. Max 10 words. Clipped. No warmth. No 'you should'. Address the shopper as you. " +
  "UK spelling. No emoji, no exclamation marks, no greetings, no 'happy to', no film quotes. ";

export type SayContext = {
  verdict: Verdict;
  title: string;
  priceGbp: number;
  fabric?: string;
  store?: string;
  shopperName?: string;
  /** Deterministic signals, e.g. "3 wide-leg at COS". */
  signals?: string[];
};

const BANNED =
  /!|happy to|cerulean|florals for spring|florals|groundbreaking|gird your loins|that's all|of course|absolutely|delighted|love to/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function cleanLine(raw: unknown, maxWords: number): string | null {
  if (typeof raw !== "string") return null;
  const line = raw.replace(/\s+/g, " ").replace(/^["'“”]+|["'“”]+$/g, "").trim();
  if (!line || line.split(" ").length > maxWords) return null;
  if (BANNED.test(line) || EMOJI.test(line)) return null;
  return line;
}

/** Rephrase a verdict in Miranda's voice. Null on any doubt -> caller keeps the template. */
export async function mirandaSay(ctx: SayContext): Promise<string | null> {
  if (!llmAvailable()) return null;
  const v = ctx.verdict;
  const verdictWord = v.kind === "suggest" ? "YES, buy it" : v.kind === "bad" ? "NO, skip it" : "MEH, only if they must";
  const facts = [
    `Verdict: ${verdictWord}.`,
    `Reason (template): ${v.because}`,
    v.fails.length ? `Fails: ${v.fails.join(", ")}.` : "",
    `Item: ${ctx.title}, £${ctx.priceGbp}${ctx.fabric ? `, ${ctx.fabric}` : ""}${ctx.store ? `, at ${ctx.store}` : ""}.`,
    ctx.shopperName ? `Shopper: ${ctx.shopperName}.` : "",
    ctx.signals?.length ? `Known about her: ${ctx.signals.slice(0, 3).join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const out = await callJson<{ line: string }>(
    VOICE + "The line MUST agree with the verdict and use only the facts given. Never invent products, prices, fabrics or history.",
    facts,
    LINE_SCHEMA,
    80,
  );
  const line = cleanLine(out?.line, 22);
  if (!line) return null;
  // Guard rails: no price other than the real one; no contradiction of the verdict.
  const price = line.match(/£\s?(\d+)/);
  if (price && Number(price[1]) !== ctx.priceGbp) return null;
  if (v.kind === "bad" && /\b(wear it|buy it|take it|get it|this one)\b/i.test(line)) return null;
  if (v.kind === "suggest" && /\b(next\.|pointless|skip|don't bother|no\.)/i.test(line)) return null;
  return line;
}

/** Greetings / "who are you" / off-topic: 1-2 cold lines that steer to the brief. */
export async function smallTalk(text: string, shopperName = "Alex"): Promise<string | null> {
  if (!llmAvailable()) return null;
  const out = await callJson<{ line: string }>(
    VOICE +
      "Reply to small talk in 1-2 short sentences. Fashion editor, not a friend. Dismiss the chit-chat. " +
      "Make no claims about products, shops or prices. End with exactly: State what you need.",
    `Shopper ${shopperName} says: ${text.slice(0, 300)}`,
    LINE_SCHEMA,
    80,
  );
  const line = cleanLine(out?.line, 40);
  if (!line) return null;
  if (/£|\bstock\b|\bsale\b/i.test(line)) return null;
  return /state what you need\.?$/i.test(line) ? line : `${line} State what you need.`;
}

// ---------------------------------------------------------------------------
// 3. Retailer product listings via Responses + web_search (~12s).
//    Callers must treat [] as "use shop search pages without photos".
// ---------------------------------------------------------------------------

export type RetailerHit = {
  title: string;
  url: string;
  retailer: string;
  priceGbp?: number;
  fabric?: string;
  /** Direct product photo (og:image / CDN jpg|webp) from that PDP. */
  imageUrl?: string;
};

const SHOP_HOST =
  /\b(asos\.com|zara\.com|shop\.mango\.com|mango\.com|hm\.com|www2\.hm\.com|cos\.com|arket\.com|nobodyschild\.com|wilsoncarter-london\.com)\b/i;

const STOCK_IMAGE_HOST =
  /wikimedia|openverse|pexels|unsplash|flickr|pixabay|shutterstock/i;

function isSearchPageUrl(url: string): boolean {
  return /[?&](q|kw|searchTerm|search)=/i.test(url) || /\/search(?:-results)?\b/i.test(url);
}

function extractOutputText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const rec = data as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };
  if (rec.output_text?.trim()) return rec.output_text;
  const bits: string[] = [];
  for (const item of rec.output ?? []) {
    for (const c of item.content ?? []) {
      if (c.text) bits.push(c.text);
    }
  }
  return bits.join("\n");
}

function parseRetailerHits(raw: string): RetailerHit[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Array<{
      title?: string;
      url?: string;
      retailer?: string;
      priceGbp?: number;
      fabric?: string;
      imageUrl?: string;
    }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (h) =>
          typeof h?.url === "string" &&
          /^https:\/\//i.test(h.url) &&
          SHOP_HOST.test(h.url) &&
          !isSearchPageUrl(h.url),
      )
      .slice(0, 3)
      .map((h) => {
        let imageUrl: string | undefined;
        if (typeof h.imageUrl === "string" && /^https:\/\//i.test(h.imageUrl)) {
          try {
            const host = new URL(h.imageUrl).hostname;
            if (!STOCK_IMAGE_HOST.test(host)) imageUrl = h.imageUrl;
          } catch {
            imageUrl = undefined;
          }
        }
        return {
          title: (h.title ?? "").trim() || "Seen on the web",
          url: h.url as string,
          retailer: (h.retailer ?? "").trim() || "shop",
          priceGbp: typeof h.priceGbp === "number" && h.priceGbp > 0 ? h.priceGbp : undefined,
          fabric: typeof h.fabric === "string" && h.fabric.trim() ? h.fabric.trim() : undefined,
          imageUrl,
        };
      });
  } catch {
    return [];
  }
}

/** Real product pages only. Empty on timeout, 4xx, or invented hosts. */
export async function findRetailerHits(query: string): Promise<RetailerHit[]> {
  if (!llmAvailable() || !query.trim()) return [];
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return [];
  const m = await ensureModel();
  const ctrl = new AbortController();
  // web_search often needs ~15s; aborting at 12s left openaiHits at 0 on prod.
  const timer = setTimeout(() => ctrl.abort(), 22_000);
  try {
    const res = await fetch(RESPONSES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: m,
        tools: [
          {
            type: "web_search",
            filters: {
              allowed_domains: [
                "asos.com",
                "zara.com",
                "shop.mango.com",
                "hm.com",
                "www2.hm.com",
                "cos.com",
              ],
            },
          },
        ],
        input:
          `Find exactly 3 REAL current UK product listings (PDPs) for: ${query.slice(0, 80)}. ` +
          `Retailers only: ASOS, Zara, Mango, H&M, COS. One listing per retailer when possible. ` +
          `Each url MUST be a product detail page (PDP), never a search results page (?q= /search). ` +
          `Reply with JSON array only: [{"title","url","retailer","priceGbp","imageUrl"}]. ` +
          `title is the real product name. priceGbp is GBP if known, else omit. ` +
          `imageUrl MUST be a direct https image URL (og:image or CDN .jpg/.webp) for THAT product. ` +
          `Omit imageUrl if you cannot find a real product photo. Never invent URLs or use Wikimedia/stock.`,
        reasoning: { effort: "none" },
        max_output_tokens: 800,
      }),
    });
    if (!res.ok) {
      console.warn(`[llm] retailer search ${res.status} (model=${m})`);
      return [];
    }
    const data: unknown = await res.json();
    const hits = parseRetailerHits(extractOutputText(data));
    if (hits.length === 0) {
      console.warn(`[llm] retailer search parsed 0 hits (model=${m})`);
    }
    return hits;
  } catch (err) {
    const name = err instanceof Error ? err.name : "error";
    console.warn(`[llm] retailer search failed: ${name}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
