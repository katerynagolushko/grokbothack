import type { ShopperProfile } from "@/lib/profiles";

/** Per-shopper hero copy. Same store, different front door. */
export const HERO_COPY: Record<
  ShopperProfile["id"],
  { eyebrow: string; headline: string; sub: string }
> = {
  alex: {
    eyebrow: "Edited for Alex",
    headline: "Black. Tailored. Wide-leg. Nothing else.",
    sub: "Miranda cut the floor to what you actually wear. Bad takes stay visible, ranked last.",
  },
  bea: {
    eyebrow: "Edited for Bea",
    headline: "Loud, fitted, sporty. Wool need not apply.",
    sub: "Miranda put the logo tees and track jackets first. Anything itchy sits at the bottom.",
  },
};

export function TailoredHero({
  profile,
  storeName,
  counts,
  compact = false,
}: {
  profile: ShopperProfile;
  storeName: string;
  counts?: { suggest: number; meh: number; bad: number };
  compact?: boolean;
}) {
  const copy = HERO_COPY[profile.id];
  return (
    <section
      className={`thero thero--${profile.id} ${compact ? "thero--compact" : ""}`}
      aria-label={`${storeName} for ${profile.name}`}
    >
      <p className="thero__eyebrow">
        {storeName} · {copy.eyebrow}
      </p>
      <h2 className="thero__headline">{copy.headline}</h2>
      <p className="thero__sub">{copy.sub}</p>
      {counts && (
        <p className="thero__counts">
          <span className="thero__count thero__count--suggest">{counts.suggest} suggested</span>
          <span className="thero__count">{counts.meh} meh</span>
          <span className="thero__count thero__count--bad">{counts.bad} bad takes</span>
        </p>
      )}
    </section>
  );
}
