import type { Metadata } from "next";
import { MerchantView } from "@/components/merchant/MerchantView";

export const metadata: Metadata = {
  title: "Miranda for shops",
  description:
    "Same catalogue, different grid. Consented taste cards and proof that a buyer agent raises match rate.",
};

export default function MerchantPage() {
  return (
    <main className="page-merchant">
      <MerchantView />
    </main>
  );
}
