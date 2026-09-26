import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SignalsStrip } from "@/components/tailored/SignalsStrip";
import { TailoredGrid } from "@/components/tailored/TailoredGrid";
import { TailoredHero } from "@/components/tailored/TailoredHero";
import { getStoreProducts } from "@/lib/products";
import { getProfile, hasConsent, listProfiles } from "@/lib/profiles";
import { rankCounts, rankForShopper } from "@/lib/rank";
import type { StoreId } from "@/lib/types";

const STORES: { id: StoreId; name: string }[] = [
  { id: "runway", name: "Runway" },
  { id: "archive", name: "Archive" },
];

export const metadata = {
  title: "Same store. Two shoppers. — Miranda",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const sp = await searchParams;
  const store = STORES.find((s) => s.id === sp.store) ?? STORES[0];
  const products = getStoreProducts(store.id);
  const shoppers = listProfiles();

  return (
    <div className="compare">
      <header className="compare__head">
        <div className="compare__brand-row">
          <Link href="/" className="compare__brand">
            <Image src="/miranda-avatar.png" alt="" width={40} height={40} className="compare__avatar" />
            Miranda
          </Link>
          <SiteNav active="compare" />
        </div>
        <h1 className="compare__title">Same store. Two shoppers.</h1>
        <p className="compare__lede">
          One catalogue. Miranda reorders it per shopper from a profile she learnt on WhatsApp,
          including what they bought and returned elsewhere. The store only sees the consented card.
        </p>
        <nav className="compare__stores" aria-label="Store">
          {STORES.map((s) => (
            <Link
              key={s.id}
              href={`/compare?store=${s.id}`}
              className={`compare__store ${s.id === store.id ? "compare__store--active" : ""}`}
            >
              {s.name}
            </Link>
          ))}
          <span className="compare__stores-note">{products.length} products, identical for both.</span>
        </nav>
      </header>

      <div className="compare__cols">
        {shoppers.map((p) => {
          const profile = getProfile(p.id);
          const consented = hasConsent(profile, store.id);
          const ranked = rankForShopper(profile, products, store.id);
          const counts = rankCounts(ranked);
          const top = ranked[0];
          return (
            <section key={p.id} className={`compare__col compare__col--${p.id}`} aria-label={`${store.name} for ${p.name}`}>
              <div className="compare__who">
                <span className="compare__who-name">{p.name}</span>
                <span className="compare__who-meta">
                  size {profile.sizes.bottom} · {profile.coloursLiked.slice(0, 3).join(", ")} · £
                  {profile.budget.top[0]}–{profile.budget.top[1]} tops
                </span>
              </div>
              {consented ? (
                <>
                  <TailoredHero profile={profile} storeName={store.name} counts={counts} compact />
                  <SignalsStrip profile={profile} max={3} />
                  <TailoredGrid items={ranked} user={p.id} store={store.id} reasonsFor={8} limit={8} dense />
                  {top && (
                    <p className="compare__topline">
                      #1 for {p.name}: <strong>{top.product.title}</strong>. &ldquo;{top.reason}&rdquo;
                    </p>
                  )}
                </>
              ) : (
                <div className="compare__noconsent">
                  <p className="compare__noconsent-title">{p.name} has not shared with {store.name}.</p>
                  <p>
                    {store.name} gets the generic order and nothing else. No card, no ranking, no history.
                    <code> GET /api/profile?user={p.id}&store={store.id} → 403</code>
                  </p>
                  <Link href={`/shop/${store.id}?user=${p.id}&miranda=1`} className="compare__noconsent-link">
                    Open {store.name} as {p.name} to see the consent prompt →
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <footer className="compare__foot">
        <p className="compare__moat">
          Alex&rsquo;s top picks come from what she bought at COS and Fleek. Not here.
        </p>
        <p className="compare__api">
          Stores call <code>GET /api/profile?user=alex&store={store.id}</code> and{" "}
          <code>POST /api/rank</code>. Consent off → <code>403</code>. Receipts and chats never leave Miranda.
        </p>
        <p className="compare__links">
          <Link href={`/shop/${store.id}?user=alex&miranda=1`}>Open {store.name} as Alex</Link>
          <span> · </span>
          <Link href={`/shop/${store.id}?user=bea&miranda=1`}>as Bea</Link>
        </p>
      </footer>
    </div>
  );
}
