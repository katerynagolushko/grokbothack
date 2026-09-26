import {
  CROSS_STORE_PROFILES,
  PARTNER_STORES,
  crossStoreBrandCount,
  crossStoreItemCount,
  crossStoreReturnCount,
  type CrossStoreProfile,
  type PartnerStore,
} from "@/lib/merchantProof";
import styles from "./merchant-extra.module.css";

const STORE_LABEL: Record<PartnerStore, string> = {
  runway: "Runway",
  archive: "Archive",
};

function ConsentPill({
  store,
  shared,
}: {
  store: PartnerStore;
  shared: boolean;
}) {
  return (
    <span
      className={[styles.pill, shared ? styles.pillOn : styles.pillOff].join(" ")}
      aria-label={`${STORE_LABEL[store]}: ${shared ? "shared" : "not shared"}`}
    >
      <span className={styles.pillDot} aria-hidden />
      <span className={styles.pillStore}>{STORE_LABEL[store]}</span>
      {shared ? "Shared" : "Not shared"}
    </span>
  );
}

function ShopperCard({ profile }: { profile: CrossStoreProfile }) {
  const items = crossStoreItemCount(profile);
  const brands = crossStoreBrandCount(profile);
  const returns = crossStoreReturnCount(profile);

  return (
    <article className={styles.knowCard} aria-label={`${profile.name}: cross-store profile`}>
      <div className={styles.knowHead}>
        <h3 className={styles.knowName}>{profile.name}</h3>
        <p className={styles.knowStyle}>
          {profile.style} · size {profile.size}
        </p>
      </div>

      <div className={styles.knowCount}>
        <span className={styles.knowCountNum}>{items}</span>
        <span className={styles.knowCountLabel}>
          purchases at {brands} other brands, {returns} return
          {returns === 1 ? "" : "s"}. None of it visible to you.
        </span>
      </div>

      <div>
        <p className={styles.knowEyebrow}>Derived signals</p>
        <ul className={styles.signalList}>
          {profile.signals.slice(0, 3).map((s) => (
            <li key={s.label} className={styles.signal}>
              <span className={styles.signalLabel}>{s.label}</span>
              <span className={styles.signalEvidence}>{s.evidence}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className={styles.knowEyebrow}>Consent per store</p>
        <div className={styles.consentRow}>
          {PARTNER_STORES.map((store) => (
            <ConsentPill
              key={store}
              store={store}
              shared={profile.consents[store]}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export function CrossStoreKnowledge() {
  return (
    <>
      <div className={styles.knowGrid}>
        {CROSS_STORE_PROFILES.map((p) => (
          <ShopperCard key={p.id} profile={p} />
        ))}
      </div>
      <p className={styles.knowFoot}>
        You get the signals, not the receipts. A store with consent gets the
        derived lines above and a ranking. A store without consent gets
        nothing. The shopper can revoke either at any time.
      </p>
    </>
  );
}
