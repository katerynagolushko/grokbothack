import { Suspense } from "react";
import Link from "next/link";
import { MirandaToggle } from "@/components/MirandaToggle";
import { ShopperPill } from "@/components/tailored/ShopperPill";
import { TailoredStorefront } from "@/components/tailored/TailoredStorefront";
import { getStoreProducts } from "@/lib/products";
import { getProfile } from "@/lib/profiles";

export default async function ArchiveShopPage({
  searchParams,
}: {
  searchParams: Promise<{ miranda?: string; user?: string }>;
}) {
  const sp = await searchParams;
  const miranda = sp.miranda === "1";
  const user = getProfile(sp.user).id;
  const products = getStoreProducts("archive");

  return (
    <div className="shop shop--archive">
      <header className="shop-header shop-header--archive">
        <div className="shop-header__row">
          <Link href="/" className="shop-header__back">
            ← Miranda
          </Link>
          <div className="shop-header__tools">
            <Link href={`/compare?store=archive`} className="shop-header__compare">
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
        store="archive"
        storeName="Archive"
        storeSub="Secondhand stock. Warehouse light."
        products={products}
        user={user}
        miranda={miranda}
      />
    </div>
  );
}
