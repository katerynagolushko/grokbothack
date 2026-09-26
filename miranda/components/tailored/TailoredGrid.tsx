"use client";

import Image from "next/image";
import Link from "next/link";
import { productImageSrc, productPath } from "@/lib/products";
import type { RankedProduct } from "@/lib/rank";

function sendView(user: string, store: string, productId: string) {
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, store, type: "view", productId }),
      keepalive: true,
    });
  } catch {
    // counters are best-effort
  }
}

/**
 * Ranked tiles. Reasons under the top `reasonsFor` tiles; bad takes badged,
 * wrong sizes greyed. Tile click fires a `view` event to /api/events.
 */
export function TailoredGrid({
  items,
  user,
  store,
  reasonsFor = 4,
  limit,
  dense = false,
}: {
  items: RankedProduct[];
  user: string;
  store: string;
  reasonsFor?: number;
  limit?: number;
  dense?: boolean;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <div className={`tgrid ${dense ? "tgrid--dense" : ""}`}>
      {shown.map((r) => {
        const p = r.product;
        const img = productImageSrc(p);
        const showReason = r.rank <= reasonsFor || r.verdict === "bad";
        return (
          <article
            key={p.id}
            className={[
              "ttile",
              `ttile--${r.verdict}`,
              r.sizeOk ? "" : "ttile--nosize",
              r.fromHistory ? "ttile--history" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Link
              href={`${productPath(p, true)}&user=${user}`}
              className="ttile__link"
              onClick={() => sendView(user, store, p.id)}
            >
              <div className="ttile__visual" style={img ? undefined : { background: p.colour }}>
                {img ? (
                  <Image src={img} alt="" fill sizes="(max-width: 700px) 45vw, 200px" className="ttile__photo" />
                ) : null}
                <span className="ttile__rank">{r.rank}</span>
                {r.verdict === "bad" && <span className="ttile__badge ttile__badge--bad">Bad take</span>}
                {r.verdict === "suggest" && <span className="ttile__badge ttile__badge--suggest">Suggested</span>}
                {!r.sizeOk && <span className="ttile__nosize">Not your size</span>}
              </div>
              <div className="ttile__body">
                <h3 className="ttile__title">{p.title}</h3>
                <p className="ttile__price">
                  £{p.priceGbp} <span className="ttile__meta">· {p.fabric} · {p.size}</span>
                </p>
                {showReason && (
                  <p className={`ttile__reason ttile__reason--${r.verdict}`}>
                    {r.reason}
                    {r.fromHistory && <span className="ttile__hist" title="From cross-store history"> · history</span>}
                  </p>
                )}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
