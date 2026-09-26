import { NextRequest } from "next/server";
import { consentedCard, getProfile, hasConsent, isShopperId, listProfiles } from "@/lib/profiles";
import { corsJson, corsPreflight } from "@/lib/storeApi";

export const runtime = "nodejs";

/**
 * GET /api/profile?user=alex&store=runway
 * The consented card a partner store may read: sizes, budget bands, colours,
 * fits, aesthetic, dealbreaker fabrics, derived signals, history count.
 * Never raw purchases. Never chat. 403 when the shopper has not consented.
 */
export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");
  const store = req.nextUrl.searchParams.get("store");

  if (!user) {
    return corsJson({
      shoppers: listProfiles().map((p) => ({ id: p.id, name: p.name })),
      usage: "GET /api/profile?user=alex&store=runway",
    });
  }
  if (!isShopperId(user)) {
    return corsJson({ error: `Unknown shopper '${user}'.` }, { status: 404 });
  }
  if (!store) {
    return corsJson({ error: "store is required." }, { status: 400 });
  }

  const profile = getProfile(user);
  if (!hasConsent(profile, store)) {
    return corsJson(
      { consent: false, user, store, message: `${profile.name} has not shared her Miranda profile with ${store}.` },
      { status: 403 },
    );
  }

  return corsJson({ consent: true, user, store, profile: consentedCard(profile) });
}

export function OPTIONS() {
  return corsPreflight();
}
