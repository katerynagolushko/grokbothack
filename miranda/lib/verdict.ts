import type {
  FailReason,
  PassReason,
  Product,
  ShopperProfile,
  Verdict,
  VerdictKind,
} from "./types";

function fabricIsDealbreaker(
  fabric: string,
  dealbreakers: string[],
): boolean {
  const lower = fabric.toLowerCase();
  return dealbreakers.some((d) => lower.includes(d.toLowerCase()));
}

function titleHitsHate(title: string, hates: string[]): boolean {
  const lower = title.toLowerCase();
  return hates.some((h) => {
    const needle = h.toLowerCase();
    if (needle === "logo") {
      return lower.includes("logo");
    }
    return lower.includes(needle);
  });
}

function aestheticOverlap(
  productTags: string[],
  shopperTags: string[],
): boolean {
  const set = new Set(shopperTags.map((t) => t.toLowerCase()));
  return productTags.some((t) => set.has(t.toLowerCase()));
}

/**
 * Deterministic verdict. No model required.
 * - dealbreaker fabric, over budget, or size mismatch → bad
 * - aesthetic overlap and no fail → suggest
 * - else meh
 * Logo / hate matches count as a soft fail that becomes "bad" via aesthetic miss
 * or we treat logo as a fail when it matches hates.
 */
export function judgeProduct(
  product: Product,
  shopper: ShopperProfile,
): Verdict {
  const fails: FailReason[] = [];
  const passes: PassReason[] = [];

  if (fabricIsDealbreaker(product.fabric, shopper.dealbreakerFabrics)) {
    fails.push("dealbreaker_fabric");
  }
  if (product.priceGbp > shopper.budgetGbp) {
    fails.push("over_budget");
  }
  if (product.size !== shopper.size) {
    fails.push("size_mismatch");
  }

  // Logo / hated styles: treat as aesthetic poison → push into bad if present
  const hated = titleHitsHate(product.title, shopper.hates) ||
    product.aesthetic.some((a) =>
      shopper.hates.some((h) => a.toLowerCase().includes(h.toLowerCase())),
    );

  const overlap =
    !hated && aestheticOverlap(product.aesthetic, shopper.aesthetic);
  if (overlap) {
    passes.push("aesthetic_overlap");
  }

  let kind: VerdictKind;
  if (fails.length > 0 || hated) {
    kind = "bad";
    // Surface hate as a conceptual fail in reasons for the because-line
    if (hated && fails.length === 0) {
      // size/fabric/budget clean but logo — still bad; reuse aesthetic path in because
    }
  } else if (overlap) {
    kind = "suggest";
  } else {
    kind = "meh";
  }

  return {
    kind,
    fails,
    passes,
    because: becauseLine(kind, fails, passes, product, shopper, hated),
  };
}

function becauseLine(
  kind: VerdictKind,
  fails: FailReason[],
  passes: PassReason[],
  product: Product,
  shopper: ShopperProfile,
  hated: boolean,
): string {
  if (kind === "bad") {
    if (fails.includes("dealbreaker_fabric")) {
      return `${capitalise(product.fabric)}. Next.`;
    }
    if (fails.includes("over_budget")) {
      return `Over. Your ceiling is £${shopper.budgetGbp}.`;
    }
    if (fails.includes("size_mismatch")) {
      return `Size ${product.size}. You wear ${shopper.size}. Pointless.`;
    }
    if (hated) {
      return `A logo. How original.`;
    }
    return `No.`;
  }

  const fabricUnknown = !product.fabric || /^(unlisted|unknown|n\/a)$/i.test(product.fabric);

  if (kind === "suggest" && passes.includes("aesthetic_overlap")) {
    const shopperSet = new Set(shopper.aesthetic.map((s) => s.toLowerCase()));
    const overlap = product.aesthetic.filter((a) =>
      shopperSet.has(a.toLowerCase()),
    );
    const preferred = [
      "structured",
      "sharp",
      "minimal",
      "monochrome",
      "heritage",
      "tailored",
    ];
    const tag =
      preferred.find((p) =>
        overlap.some((o) => o.toLowerCase() === p),
      ) ??
      overlap[0] ??
      "tailored";
    const colour = product.colourName ? capitalise(product.colourName) : null;
    const line = colour
      ? `${colour}. ${capitalise(tag)}. Wear it.`
      : `${capitalise(tag)}. Wear it.`;
    return fabricUnknown ? `${line} Fabric unlisted.` : line;
  }

  if (fabricUnknown) return `Fabric unlisted. Don't invent.`;
  return `Wrong idea. Entirely.`;
}

function capitalise(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function storeCounts(
  products: Product[],
  shopper: ShopperProfile,
): { bad: number; suggest: number; meh: number } {
  let bad = 0;
  let suggest = 0;
  let meh = 0;
  for (const p of products) {
    const v = judgeProduct(p, shopper);
    if (v.kind === "bad") bad += 1;
    else if (v.kind === "suggest") suggest += 1;
    else meh += 1;
  }
  return { bad, suggest, meh };
}
