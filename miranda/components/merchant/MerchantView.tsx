import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { computeMerchantProof } from "@/lib/merchantProof";
import { BeforeAfterGrid } from "./BeforeAfterGrid";
import { CrossStoreKnowledge } from "./CrossStoreKnowledge";
import { PlugIn } from "./PlugIn";
import { ProofMetrics } from "./ProofMetrics";
import { StorefrontMorph } from "./StorefrontMorph";
import { TasteCard } from "./TasteCard";
import { WhyPayTable } from "./WhyPayTable";
import styles from "./merchant-extra.module.css";

export function MerchantView() {
  const proof = computeMerchantProof();

  return (
    <div className="merchant">
      <header className="merchant__hero">
        <div className="merchant__hero-top">
          <p className="merchant__brand">
            Miranda <span className="merchant__brand-sub">for shops</span>
          </p>
          <SiteNav active="merchant" />
        </div>
        <div className="merchant__hero-split">
          <div className="merchant__hero-copy">
            <h1 className="merchant__headline">
              Zara knows Zara. Miranda knows everything.
            </h1>
            <p className="merchant__lede">
              One portable shopper profile that follows the shopper across all
              stores and uses data on the user from every source.
            </p>
            <a className="merchant__cta-btn" href="#know">
              See what we know
            </a>
          </div>
          <StorefrontMorph />
        </div>
        <div className="merchant__hero-grain" aria-hidden />
      </header>

      <section
        id="know"
        className="merchant__section"
        aria-labelledby="know-title"
      >
        <p className="merchant__eyebrow">Cross-store history</p>
        <h2 id="know-title" className="merchant__h2">
          What we know that you don&apos;t
        </h2>
        <p className="merchant__section-lede">
          Two mock shoppers. Every purchase below happened somewhere other than
          your store. You see the derived signals, and only where the shopper
          has said yes.
        </p>
        <CrossStoreKnowledge />
      </section>

      <section
        id="proof-stage"
        className={`merchant__proof-stage ${styles.stageDivider}`}
        aria-labelledby="ba-title"
      >
        <div className="merchant__proof-head">
          <p className="merchant__eyebrow">Proof on this catalogue</p>
          <h2 id="ba-title" className="merchant__h2 merchant__h2--stage">
            Before → after
          </h2>
          <p className="merchant__section-lede">
            Top {proof.viewport} tiles for Alex. Numbers from{" "}
            <code>judgeProduct</code>, not a slide. Match rate{" "}
            {proof.matchRateOff}% → {proof.matchRateOn}%.
          </p>
        </div>
        <BeforeAfterGrid
          genericOrder={proof.genericOrder}
          mirandaOrder={proof.mirandaOrder}
          viewport={proof.viewport}
          matchRateOff={proof.matchRateOff}
          matchRateOn={proof.matchRateOn}
        />
      </section>

      <section
        className="merchant__section merchant__numbers"
        aria-labelledby="nums-title"
      >
        <h2 id="nums-title" className="merchant__h2">
          The numbers
        </h2>
        <ProofMetrics proof={proof} />
      </section>

      <section
        className="merchant__section merchant__model"
        aria-labelledby="model-title"
      >
        <div className="merchant__model-copy">
          <h2 id="model-title" className="merchant__h2">
            What the shop gets
          </h2>
          <p>
            Miranda stays with the buyer. Your site calls the API when a known
            shopper lands. The grid reorders for that shopper. You never get
            the private profile: only a consented taste card (size, budget,
            aesthetics, dealbreakers) plus derived signals from other stores.
          </p>
        </div>
        <TasteCard card={proof.tasteCard} />
      </section>

      <section
        id="plug-in"
        className="merchant__section"
        aria-labelledby="plug-title"
      >
        <p className="merchant__eyebrow">For developers</p>
        <h2 id="plug-title" className="merchant__h2">
          Plug in
        </h2>
        <p className="merchant__section-lede">
          Three endpoints. Responses below are examples from the mock profiles.
        </p>
        <PlugIn />
      </section>

      <section className="merchant__section" aria-labelledby="why-title">
        <h2 id="why-title" className="merchant__h2">
          Buyer · merchant · neither
        </h2>
        <WhyPayTable />
      </section>

      <footer className="merchant__cta">
        <p className="merchant__cta-line">
          One API call. A grid that knows the shopper. Bad takes stay visible.
        </p>
        <Link
          className="merchant__cta-btn merchant__cta-btn--dark"
          href="#plug-in"
        >
          See the API
        </Link>
      </footer>
    </div>
  );
}
