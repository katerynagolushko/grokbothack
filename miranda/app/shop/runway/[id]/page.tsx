import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MirandaPanel } from "@/components/MirandaPanel";
import { MirandaToggle } from "@/components/MirandaToggle";
import { getProduct, productImageSrc } from "@/lib/products";
import { DEMO_SHOPPER } from "@/lib/shopper";
import { judgeProduct } from "@/lib/verdict";
import Image from "next/image";

export default async function RunwayProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ miranda?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const miranda = sp.miranda === "1";
  const product = getProduct(id);
  if (!product || product.store !== "runway") notFound();

  const verdict = judgeProduct(product, DEMO_SHOPPER);
  const imageSrc = productImageSrc(product);

  return (
    <div className="shop shop--runway pdp">
      <header className="shop-header shop-header--runway">
        <div className="shop-header__row">
          <Link
            href={miranda ? "/shop/runway?miranda=1" : "/shop/runway"}
            className="shop-header__back"
          >
            ← Runway
          </Link>
          <Suspense fallback={null}>
            <MirandaToggle active={miranda} />
          </Suspense>
        </div>
      </header>

      <div className="pdp__layout">
        <div
          className="pdp__swatch"
          style={imageSrc ? undefined : { background: product.colour }}
          aria-hidden
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              sizes="(max-width: 700px) 100vw, 360px"
              className="pdp__photo"
              priority
            />
          ) : null}
        </div>
        <div className="pdp__info">
          <h1 className="pdp__title">{product.title}</h1>
          <p className="pdp__price">£{product.priceGbp}</p>
          <p className="pdp__meta">
            {product.fabric} · size {product.size}
          </p>
          <p className="pdp__tags">{product.aesthetic.join(" · ")}</p>
          <blockquote className="pdp__pitch">&ldquo;{product.sellerPitch}&rdquo;</blockquote>
          <p className="pdp__pitch-label">Seller pitch</p>
        </div>
        {miranda && (
          <MirandaPanel verdict={verdict} productTitle={product.title} />
        )}
      </div>
    </div>
  );
}
