import { NextRequest } from "next/server";
import { corsJson, corsPreflight, EVENT_TYPES, eventCounts, recordEvent, type StoreEventType } from "@/lib/storeApi";

export const runtime = "nodejs";

type Body = {
  user?: string;
  store?: string;
  type?: string;
  productId?: string;
};

/** POST /api/events { user, store, type: view|add_to_cart|purchase, productId } */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return corsJson({ error: "Expected JSON { user, store, type, productId }." }, { status: 400 });
  }
  const { user, store, type, productId } = body;
  if (!user || !store || !productId || !type || !EVENT_TYPES.includes(type as StoreEventType)) {
    return corsJson(
      { error: "user, store, productId and type (view | add_to_cart | purchase) are required." },
      { status: 400 },
    );
  }
  const ev = recordEvent({ user, store, type: type as StoreEventType, productId });
  return corsJson({ ok: true, event: ev, counts: eventCounts(store).totals });
}

/** GET /api/events?store=runway → counters for that store (all stores if omitted). */
export async function GET(req: NextRequest) {
  const store = req.nextUrl.searchParams.get("store") ?? undefined;
  return corsJson(eventCounts(store));
}

export function OPTIONS() {
  return corsPreflight();
}
