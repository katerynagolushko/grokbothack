import styles from "./merchant-extra.module.css";

const PROFILE_RESPONSE = `{
  "consent": true,
  "user": "alex",
  "store": "runway",
  "profile": {
    "name": "Alex",
    "sizes": { "top": "S", "bottom": "8" },
    "budget": { "outer": [60, 150], "bottom": [30, 90] },
    "coloursLiked": ["black", "navy", "grey"],
    "fits": ["tailored", "wide-leg", "structured"],
    "dealbreakerFabrics": ["polyester"],
    "signals": [
      "wide-leg: strong (3 buys at COS)",
      "sleeve length: runs long (returned H&M)",
      "black: 4 of 5 buys"
    ],
    "historyCount": 6
  }
}`;

const RANK_BODY = `{
  "user": "alex",
  "store": "runway",
  "products": [
    { "id": "rw-03" }, { "id": "rw-01" }, { "id": "rw-05" }
  ]
}`;

const RANK_RESPONSE = `{
  "consent": true,
  "counts": { "suggest": 2, "meh": 0, "bad": 1 },
  "items": [
    { "id": "rw-05", "rank": 1, "verdict": "suggest",
      "reason": "Fourth wide-leg. You know why.",
      "fromHistory": true },
    { "id": "rw-01", "rank": 2, "verdict": "suggest",
      "reason": "Check the sleeves. You returned H&M for less.",
      "fromHistory": true },
    { "id": "rw-03", "rank": 3, "verdict": "bad",
      "reason": "A logo. How original.",
      "fromHistory": false }
  ]
}`;

const EVENTS_BODY = `{
  "user": "alex",
  "store": "runway",
  "type": "purchase",
  "productId": "rw-05"
}`;

const EVENTS_RESPONSE = `{
  "ok": true,
  "counts": { "view": 12, "add_to_cart": 3, "purchase": 1 }
}`;

type Endpoint = {
  method: "GET" | "POST";
  path: string;
  what: string;
  blocks: { label: string; code: string }[];
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/profile?user=alex&store=runway",
    what: "The consented card for this store only. No purchases, no chat. 403 if the shopper has not shared with you.",
    blocks: [{ label: "200", code: PROFILE_RESPONSE }],
  },
  {
    method: "POST",
    path: "/api/rank",
    what: "Send your product IDs (or nothing for the whole catalogue). Get them back in order, with a reason per item. Bad takes rank last, never disappear.",
    blocks: [
      { label: "Body", code: RANK_BODY },
      { label: "200", code: RANK_RESPONSE },
    ],
  },
  {
    method: "POST",
    path: "/api/events",
    what: "Views, add-to-carts and purchases from your site. A purchase here becomes a signal for the next store, with consent.",
    blocks: [
      { label: "Body", code: EVENTS_BODY },
      { label: "200", code: EVENTS_RESPONSE },
    ],
  },
];

export function PlugIn() {
  return (
    <>
      <div className={styles.plugGrid}>
        {ENDPOINTS.map((ep) => (
          <article key={ep.path} className={styles.plugCard}>
            <div className={styles.plugHead}>
              <span className={styles.plugMethod}>{ep.method}</span>
              <code className={styles.plugPath}>{ep.path}</code>
            </div>
            <p className={styles.plugWhat}>{ep.what}</p>
            <pre className={styles.code}>
              {ep.blocks.map((b) => (
                <span key={b.label}>
                  <span className={styles.codeLabel}>{b.label}</span>
                  {b.code}
                  {"\n"}
                </span>
              ))}
            </pre>
          </article>
        ))}
      </div>
      <p className={styles.plugLine}>
        One script tag or one API call. Consent per store. Never chats, never
        receipts.
      </p>
      <p className={styles.plugRoadmap}>
        <strong>Roadmap:</strong> Gmail order-email import, affiliate purchase
        signals, generative storefront via OpenUI.
      </p>
    </>
  );
}
