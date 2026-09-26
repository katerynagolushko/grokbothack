export type StoreId = "runway" | "archive" | "web";

/** Garment families. Catalogue products carry one; queries can name several. */
export type GarmentKind =
  | "blazer"
  | "jacket"
  | "coat"
  | "trousers"
  | "jeans"
  | "skirt"
  | "dress"
  | "tee"
  | "shirt"
  | "hoodie"
  | "sweat"
  | "top"
  | "knit"
  | "cardigan"
  | "shoes"
  | "bag";

export type VerdictKind = "bad" | "suggest" | "meh";

export type FailReason =
  | "dealbreaker_fabric"
  | "over_budget"
  | "size_mismatch";

export type PassReason = "aesthetic_overlap";

export type Product = {
  id: string;
  store: StoreId;
  title: string;
  priceGbp: number;
  fabric: string;
  size: string;
  aesthetic: string[];
  /** Hex swatch, used when there is no photo. */
  colour: string;
  /** Plain colour word(s) as a shopper would type them: "black", "navy". */
  colourName?: string;
  category?: GarmentKind;
  sellerPitch: string;
  /** Absolute https URL for web-sourced items; catalogue items use /products/<id>.jpg. */
  imageUrl?: string;
  /** "web" when synthesised from a live image search. */
  source?: "catalogue" | "web";
  /** Photo page for web-sourced items (where the chat link goes). */
  sourceUrl?: string;
};

export type ShopperProfile = {
  id: string;
  name: string;
  aesthetic: string[];
  dealbreakerFabrics: string[];
  budgetGbp: number;
  size: string;
  hates: string[];
};

export type Verdict = {
  kind: VerdictKind;
  fails: FailReason[];
  passes: PassReason[];
  because: string;
};

export type JourneyStop = {
  product: Product;
  verdict: Verdict;
  href: string;
  imageUrl?: string;
};

/** Structured Miranda reply for web UI / WhatsApp. */
export type MirandaReply = {
  text: string;
  imageUrl?: string;
  link?: string;
  productId?: string;
  kind?: VerdictKind | "plan";
  title?: string;
  priceGbp?: number;
};
