import type { ShopperProfile } from "./types";

/** One demo shopper: tailored, no polyester, £80, size 8, hates logo tees. */
export const DEMO_SHOPPER: ShopperProfile = {
  id: "alex",
  name: "Alex",
  aesthetic: ["tailored", "minimal", "structured", "monochrome", "sharp"],
  dealbreakerFabrics: ["polyester", "poly"],
  budgetGbp: 80,
  size: "8",
  hates: ["logo", "logo tee", "graphic tee"],
};
