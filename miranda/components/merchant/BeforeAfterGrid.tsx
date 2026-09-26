"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { productImageSrc } from "@/lib/products";
import type { Product } from "@/lib/types";
import { judgeProduct } from "@/lib/verdict";
import { DEMO_SHOPPER } from "@/lib/shopper";
import { CountUp } from "./CountUp";

type Mode = "before" | "after";

function Tile({
  product,
  mode,
  index,
}: {
  product: Product;
  mode: Mode;
  index: number;
}) {
  const src = productImageSrc(product);
  const verdict = judgeProduct(product, DEMO_SHOPPER);
  const kind = verdict.kind;
  const isBefore = mode === "before";
  const stamp =
    isBefore && kind === "bad"
      ? "Skip"
      : isBefore && kind === "meh"
        ? "Mismatch"
        : !isBefore && kind === "suggest"
          ? "Wear this"
          : !isBefore && kind === "bad"
            ? "Still visible"
            : null;

  return (
    <li
      className={[
        "ba-tile",
        `ba-tile--${mode}`,
        `ba-tile--${kind}`,
      ].join(" ")}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div
        className="ba-tile__swatch"
        style={src ? undefined : { background: product.colour }}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 700px) 28vw, 140px"
            className="ba-tile__photo"
          />
        ) : null}
        {stamp ? (
          <span className={`ba-tile__stamp ba-tile__stamp--${kind}`}>
            {stamp}
          </span>
        ) : null}
      </div>
      <p className="ba-tile__title">{product.title}</p>
      <p className="ba-tile__price">£{product.priceGbp}</p>
    </li>
  );
}

export function BeforeAfterGrid({
  genericOrder,
  mirandaOrder,
  viewport,
  matchRateOff,
  matchRateOn,
}: {
  genericOrder: Product[];
  mirandaOrder: Product[];
  viewport: number;
  matchRateOff: number;
  matchRateOn: number;
}) {
  const [mode, setMode] = useState<Mode>("after");
  const [holding, setHolding] = useState(false);
  const showMode: Mode = holding ? "before" : mode;

  const before = genericOrder.slice(0, Math.max(viewport, 12));
  const after = mirandaOrder.slice(0, Math.max(viewport, 12));
  const products = showMode === "before" ? before : after;
  const rate = showMode === "before" ? matchRateOff : matchRateOn;

  const endHold = useCallback(() => setHolding(false), []);

  useEffect(() => {
    const up = () => setHolding(false);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  return (
    <div className={`ba-stage ba-stage--${showMode}`}>
      <div className="ba-stage__rail">
        <div className="ba-stage__labels" role="tablist" aria-label="Grid mode">
          <button
            type="button"
            role="tab"
            aria-selected={showMode === "before"}
            className={
              showMode === "before"
                ? "ba-stage__tab ba-stage__tab--active"
                : "ba-stage__tab"
            }
            onClick={() => setMode("before")}
          >
            Before
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showMode === "after"}
            className={
              showMode === "after"
                ? "ba-stage__tab ba-stage__tab--active ba-stage__tab--after"
                : "ba-stage__tab"
            }
            onClick={() => setMode("after")}
          >
            After
          </button>
        </div>

        <p className="ba-stage__rate" aria-live="polite">
          <CountUp
            key={`${showMode}-${rate}`}
            value={rate}
            suffix="%"
            className="ba-stage__rate-num"
          />
          <span className="ba-stage__rate-label">
            match in top {viewport}
            <span className="ba-stage__rate-mode">
              {showMode === "before" ? " · catalogue order" : " · Miranda on"}
            </span>
          </span>
        </p>

        <button
          type="button"
          className="ba-stage__hold"
          aria-pressed={holding}
          onMouseDown={() => setHolding(true)}
          onTouchStart={(e) => {
            e.preventDefault();
            setHolding(true);
          }}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchEnd={endHold}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setHolding(true);
            }
          }}
          onKeyUp={endHold}
        >
          Hold to see before
        </button>
      </div>

      <p className="ba-stage__caption">
        {showMode === "before"
          ? "Generic listing. Bad takes mixed through the first scroll. Matches buried."
          : "Same SKUs, taste reorder. Matches first. Bad takes stay visible — that is the trust."}
      </p>

      <ul
        key={showMode}
        className={`ba-stage__grid ba-stage__grid--${showMode}`}
        aria-label={
          showMode === "before" ? "Catalogue order" : "Miranda reorder"
        }
      >
        {products.map((p, i) => (
          <Tile key={`${showMode}-${p.id}`} product={p} mode={showMode} index={i} />
        ))}
      </ul>

      <div className="ba-split" aria-hidden="true">
        <div className="ba-split__col ba-split__col--before">
          <p className="ba-split__tag">Before · {matchRateOff}%</p>
          <ul className="ba-split__grid">
            {before.slice(0, 8).map((p, i) => (
              <Tile key={`split-b-${p.id}`} product={p} mode="before" index={i} />
            ))}
          </ul>
        </div>
        <div className="ba-split__col ba-split__col--after">
          <p className="ba-split__tag">After · {matchRateOn}%</p>
          <ul className="ba-split__grid">
            {after.slice(0, 8).map((p, i) => (
              <Tile key={`split-a-${p.id}`} product={p} mode="after" index={i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
