"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProfile, type ShopperId } from "@/lib/profiles";
import { productImageSrc, productPath } from "@/lib/products";
import { rankCounts, rankForShopper } from "@/lib/rank";
import type { Product, StoreId } from "@/lib/types";
import { SignalsStrip } from "./SignalsStrip";
import { TailoredGrid } from "./TailoredGrid";
import { TailoredHero } from "./TailoredHero";

type Consent = "granted" | "declined" | "unset";

function consentKey(store: string, user: string) {
  return `miranda.consent.${store}.${user}`;
}

function readConsent(store: string, user: string): Consent {
  if (typeof window === "undefined") return "unset";
  const v = window.localStorage.getItem(consentKey(store, user));
  return v === "1" ? "granted" : v === "0" ? "declined" : "unset";
}

/**
 * Store listing with Miranda on: consent gate, per-shopper hero, ranked grid,
 * signals strip. Miranda off or consent declined: generic catalogue order.
 */
export function TailoredStorefront({
  store,
  storeName,
  storeSub,
  products,
  user,
  miranda,
}: {
  store: StoreId;
  storeName: string;
  storeSub: string;
  products: Product[];
  user: ShopperId;
  miranda: boolean;
}) {
  const profile = getProfile(user);
  const [consent, setConsent] = useState<Consent>("unset");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readConsent(store, user);
    if (stored !== "unset") {
      setConsent(stored);
    } else {
      // Profile default decides whether we ask. Alex pre-consented; Bea has not for Archive.
      setConsent(profile.consents[store] ? "granted" : "unset");
    }
    setHydrated(true);
  }, [store, user, profile]);

  function decide(granted: boolean) {
    window.localStorage.setItem(consentKey(store, user), granted ? "1" : "0");
    setConsent(granted ? "granted" : "declined");
  }

  function revoke() {
    window.localStorage.setItem(consentKey(store, user), "0");
    setConsent("declined");
  }

  const ranked = useMemo(() => rankForShopper(profile, products, store), [profile, products, store]);
  const counts = useMemo(() => rankCounts(ranked), [ranked]);

  const tailored = miranda && hydrated && consent === "granted";
  const askConsent = miranda && hydrated && consent === "unset";

  return (
    <>
      {askConsent && (
        <div className="consent" role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <div className="consent__card">
            <Image src="/miranda-avatar.png" alt="" width={44} height={44} className="consent__avatar" />
            <h2 id="consent-title" className="consent__title">
              Share your Miranda profile with {storeName.toUpperCase()}?
            </h2>
            <p className="consent__body">
              She shares your sizes, budget and taste. Never your chats or receipts.
            </p>
            <div className="consent__actions">
              <button type="button" className="consent__btn consent__btn--yes" onClick={() => decide(true)}>
                Share
              </button>
              <button type="button" className="consent__btn" onClick={() => decide(false)}>
                No
              </button>
            </div>
            <p className="consent__fine">
              {storeName} gets a taste card and a ranked list. Your purchase history stays with Miranda.
            </p>
          </div>
        </div>
      )}

      {tailored ? (
        <>
          <TailoredHero profile={profile} storeName={storeName} counts={counts} />
          <SignalsStrip profile={profile} />
          <p className="tconsent-line">
            Sharing sizes, budget and taste with {storeName}.{" "}
            <button type="button" className="tconsent-line__revoke" onClick={revoke}>
              Stop sharing
            </button>
          </p>
          <TailoredGrid items={ranked} user={user} store={store} reasonsFor={4} />
        </>
      ) : (
        <>
          <h1 className="shop-header__title">{storeName}</h1>
          <p className="shop-header__sub">{storeSub}</p>
          {miranda && hydrated && consent === "declined" && (
            <p className="tconsent-line tconsent-line--off">
              {profile.name} is not sharing with {storeName}. Generic order.{" "}
              <button type="button" className="tconsent-line__revoke" onClick={() => setConsent("unset")}>
                Change
              </button>
            </p>
          )}
          <div className="product-grid tgrid-plain">
            {products.map((p) => {
              const img = productImageSrc(p);
              return (
                <article key={p.id} className="product-card">
                  <Link href={`${productPath(p, miranda)}${miranda ? "&" : "?"}user=${user}`} className="product-card__link">
                    <div className="product-card__swatch" style={img ? undefined : { background: p.colour }} aria-hidden>
                      {img ? (
                        <Image src={img} alt="" fill sizes="(max-width: 700px) 50vw, 220px" className="product-card__photo" />
                      ) : null}
                    </div>
                    <div className="product-card__body">
                      <h3 className="product-card__title">{p.title}</h3>
                      <p className="product-card__price">£{p.priceGbp}</p>
                      <p className="product-card__meta">
                        {p.fabric} · size {p.size}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
