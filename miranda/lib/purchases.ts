/**
 * In-memory purchase log for the WhatsApp demo. Writes straight into the
 * shared PROFILES objects, so /api/profile, /api/rank, /compare and the shop
 * pages see the new purchase on their next request. Module memory only: a
 * cold start (new serverless instance / redeploy) resets to the seed data.
 */
import { getProfile, type Purchase, type ShopperId, type ShopperProfile, isShopperId } from "./profiles";

const phoneToShopper = new Map<string, ShopperId>();

/** Phone -> shopper. Unknown numbers are Alex (the demo shopper). */
export function shopperForPhone(phone?: string | null): ShopperId {
  if (!phone) return "alex";
  return phoneToShopper.get(phone.replace(/\D/g, "")) ?? "alex";
}

export function bindPhone(phone: string, shopper: string): void {
  if (isShopperId(shopper)) phoneToShopper.set(phone.replace(/\D/g, ""), shopper);
}

const ORDINALS = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
const FIT_WORDS = ["wide-leg", "wide leg", "fitted", "oversized", "tailored", "logo", "track", "structured", "cropped"];

function ordinal(n: number): string {
  return ORDINALS[n] ?? `${n}th`;
}

function descriptorOf(p: Purchase): string {
  const item = p.item.toLowerCase();
  const fit = FIT_WORDS.find((w) => item.includes(w));
  if (fit) return fit.replace(" ", "-");
  return p.category !== "other" ? p.category : item.split(" ").slice(-1)[0] ?? "piece";
}

export type RecordResult = {
  profile: ShopperProfile;
  /** Kept purchases matching the same descriptor after this one (or returns count). */
  count: number;
  descriptor: string;
  /** Cold confirmation, computed, no model. "Noted. Fourth wide-leg." */
  line: string;
};

/** Append a purchase or mark a return. Deterministic confirmation line. */
export function recordPurchase(shopperId: ShopperId, purchase: Purchase): RecordResult {
  const profile = getProfile(shopperId);
  const descriptor = descriptorOf(purchase);

  if (purchase.returned) {
    // Prefer marking an existing kept item from the same store + category.
    const existing = [...profile.purchases]
      .reverse()
      .find(
        (p) =>
          !p.returned &&
          p.store.toLowerCase() === purchase.store.toLowerCase() &&
          (p.category === purchase.category || p.item.toLowerCase().includes(descriptor)),
      );
    if (existing) {
      existing.returned = true;
      existing.returnReason = purchase.returnReason ?? existing.returnReason;
    } else {
      profile.purchases.push(purchase);
    }
    const returns = profile.purchases.filter((p) => p.returned).length;
    const reason = purchase.returnReason ? ` ${capitalise(purchase.returnReason)}.` : "";
    return {
      profile,
      count: returns,
      descriptor,
      line: `Noted. ${purchase.store} ${purchase.category === "other" ? purchase.item : purchase.category} back.${reason} ${returns} ${returns === 1 ? "return" : "returns"} on file.`,
    };
  }

  profile.purchases.push(purchase);
  const count = profile.purchases.filter(
    (p) => !p.returned && (p.item.toLowerCase().includes(descriptor) || (descriptor === p.category && p.category !== "other")),
  ).length;
  const line = count > 1 ? `Noted. ${ordinal(count)} ${descriptor}.` : `Noted. ${capitalise(purchase.item)}, ${purchase.store}.`;
  return { profile, count, descriptor, line };
}

function capitalise(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
