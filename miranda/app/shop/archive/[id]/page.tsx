import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MirandaPanel } from "@/components/MirandaPanel";
import { MirandaToggle } from "@/components/MirandaToggle";
import { getProduct, productImageSrc } from "@/lib/products";
import { DEMO_SHOPPER } from "@/lib/shopper";
import { judgeProduct } from "@/lib/verdict";
import Image from "next/image";

export default async function ArchiveProductPage({
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
  if (!product || product.store !== "archive") notFound();

  const verdict = judgeProduct(product, DEMO_SHOPPER);
  const imageSrc = productImageSrc(product);

  return (
    <div className="shop shop--archive pdp">
      <header className="shop-header shop-header--archive">
        <div className="shop-header__row">
          <Link
            href={miranda ? "/shop/archive?miranda=1" : "/shop/archive"}
            className="shop-header__back"
          >
            ← Archive
          </Link>
          <Suspense fallback={null}>
            <MirandaToggle active={miranda} />
          </Suspense>
        </div>
      </header>

      <div className="pdp__layout pdp__layout--archive">
        <div
          className="pdp__swatch pdp__swatch--archive"
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
          <h1 className="pdp__title pdp__title--archive">{product.title}</h1>
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
