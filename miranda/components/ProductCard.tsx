import type { Product } from "@/lib/types";
import type { Verdict } from "@/lib/types";
import { productImageSrc } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({
  product,
  href,
  miranda,
  verdict,
}: {
  product: Product;
  href: string;
  miranda: boolean;
  verdict?: Verdict;
}) {
  const bad = miranda && verdict?.kind === "bad";
  const suggest = miranda && verdict?.kind === "suggest";
  const imageSrc = productImageSrc(product);

  return (
    <article
      className={[
        "product-card",
        bad ? "product-card--bad" : "",
        suggest ? "product-card--suggest" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={href} className="product-card__link">
        <div
          className="product-card__swatch"
          style={imageSrc ? undefined : { background: product.colour }}
          aria-hidden
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="(max-width: 700px) 50vw, 220px"
              className="product-card__photo"
            />
          ) : null}
        </div>
        <div className="product-card__body">
          <h3 className="product-card__title">{product.title}</h3>
          <p className="product-card__price">£{product.priceGbp}</p>
          <p className="product-card__meta">
            {product.fabric} · size {product.size}
          </p>
          {miranda && verdict && (
            <p className={`product-card__verdict product-card__verdict--${verdict.kind}`}>
              {verdict.kind === "bad"
                ? "Bad take"
                : verdict.kind === "suggest"
                  ? "Suggested"
                  : "Meh"}
              {" — "}
              {verdict.because}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
