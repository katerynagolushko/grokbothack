import { NextResponse } from "next/server";

/**
 * Shared helpers for the partner-store API (/api/profile, /api/rank, /api/events).
 * A store snippet calls these cross-origin, so every response carries CORS `*`.
 */

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export function corsJson(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// —— In-memory event counters. Resets on cold start; fine for the demo. ——

export type StoreEventType = "view" | "add_to_cart" | "purchase";

export const EVENT_TYPES: StoreEventType[] = ["view", "add_to_cart", "purchase"];

export type StoreEvent = {
  user: string;
  store: string;
  type: StoreEventType;
  productId: string;
  at: string;
};

type Counter = Record<StoreEventType, number>;

const globalStore = globalThis as unknown as {
  __mirandaEvents?: { byStore: Map<string, Counter>; byProduct: Map<string, Counter>; recent: StoreEvent[] };
};

function db() {
  if (!globalStore.__mirandaEvents) {
    globalStore.__mirandaEvents = { byStore: new Map(), byProduct: new Map(), recent: [] };
  }
  return globalStore.__mirandaEvents;
}

function zero(): Counter {
  return { view: 0, add_to_cart: 0, purchase: 0 };
}

export function recordEvent(ev: Omit<StoreEvent, "at">): StoreEvent {
  const d = db();
  const full: StoreEvent = { ...ev, at: new Date().toISOString() };
  const s = d.byStore.get(ev.store) ?? zero();
  s[ev.type] += 1;
  d.byStore.set(ev.store, s);
  const key = `${ev.store}:${ev.productId}`;
  const p = d.byProduct.get(key) ?? zero();
  p[ev.type] += 1;
  d.byProduct.set(key, p);
  d.recent.unshift(full);
  if (d.recent.length > 200) d.recent.length = 200;
  return full;
}

export function eventCounts(store?: string) {
  const d = db();
  const stores = store ? [store] : Array.from(d.byStore.keys());
  const totals = zero();
  const byStore: Record<string, Counter> = {};
  for (const s of stores) {
    const c = d.byStore.get(s) ?? zero();
    byStore[s] = c;
    for (const t of EVENT_TYPES) totals[t] += c[t];
  }
  const products: Record<string, Counter> = {};
  for (const [key, c] of d.byProduct) {
    const [s, id] = key.split(":");
    if (!store || s === store) products[id] = c;
  }
  const recent = d.recent.filter((e) => !store || e.store === store).slice(0, 20);
  return { store: store ?? "all", totals, byStore, products, recent };
}
