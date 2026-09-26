import { Suspense } from "react";
import Link from "next/link";
import { MirandaToggle } from "@/components/MirandaToggle";
import { ShopperPill } from "@/components/tailored/ShopperPill";
import { TailoredStorefront } from "@/components/tailored/TailoredStorefront";
import { getStoreProducts } from "@/lib/products";
import { getProfile } from "@/lib/profiles";

export default async function RunwayShopPage({
  searchParams,
}: {
  searchParams: Promise<{ miranda?: string; user?: string }>;
}) {
  const sp = await searchParams;
  const miranda = sp.miranda === "1";
  const user = getProfile(sp.user).id;
  const products = getStoreProducts("runway");

  return (
    <div className="shop shop--runway">
      <header className="shop-header shop-header--runway">
        <div className="shop-header__row">
          <Link href="/" className="shop-header__back">
            ← Miranda
          </Link>
          <div className="shop-header__tools">
            <Link href={`/compare?store=runway`} className="shop-header__compare">
              Compare
            </Link>
            <Suspense fallback={null}>
              <ShopperPill current={user} />
            </Suspense>
            <Suspense fallback={null}>
              <MirandaToggle active={miranda} />
            </Suspense>
          </div>
        </div>
      </header>
      <TailoredStorefront
        store="runway"
        storeName="Runway"
        storeSub="Polished pieces. Seller pitch included."
        products={products}
        user={user}
        miranda={miranda}
      />
    </div>
  );
}
