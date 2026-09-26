import { signalStrip, type ShopperProfile } from "@/lib/profiles";

/** Thin line: "Miranda knows: 3 wide-leg at COS · returned H&M (sleeves) · no polyester". */
export function SignalsStrip({ profile, max = 4 }: { profile: ShopperProfile; max?: number }) {
  const bits = signalStrip(profile, max);
  return (
    <p className={`tsignals tsignals--${profile.id}`}>
      <span className="tsignals__label">Miranda knows:</span>{" "}
      {bits.map((b, i) => (
        <span key={b}>
          {i > 0 && <span className="tsignals__dot"> · </span>}
          {b}
        </span>
      ))}
      <span className="tsignals__note"> · {profile.purchases.length} purchases across {new Set(profile.purchases.map((p) => p.store)).size} stores. None of them here.</span>
    </p>
  );
}
