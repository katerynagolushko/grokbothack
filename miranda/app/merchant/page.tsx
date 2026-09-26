import type { Metadata } from "next";
import { MerchantView } from "@/components/merchant/MerchantView";

export const metadata: Metadata = {
  title: "Miranda for shops. Zara knows Zara. Miranda knows everything.",
  description:
    "One portable shopper profile that follows the shopper across all stores and uses data on the user from every source.",
};

export default function MerchantPage() {
  return (
    <main className="page-merchant">
      <MerchantView />
    </main>
  );
}
