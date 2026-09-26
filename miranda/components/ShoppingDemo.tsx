"use client";

import Image from "next/image";
import Link from "next/link";
import React, {
  type CSSProperties,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clientShopCards } from "@/lib/clientShops";
import { isDemoBlazerQuery } from "@/lib/demoCatalogue";
import { buildCatalogueJourney, closingLine, countWord, openerLine } from "@/lib/journey";
import { listingLabel, matchStopPick, pickConfirmLine } from "@/lib/pick";
import { PRODUCTS, productImageSrc, productPath } from "@/lib/products";
import { DEMO_SHOPPER } from "@/lib/shopper";
import type { Product, Verdict, VerdictKind } from "@/lib/types";
import { SiteNav } from "@/components/SiteNav";
import { judgeProduct, storeCounts } from "@/lib/verdict";

const DEMO_QUERY = "Black blazer under £80 for dinner";

type ChatMessage = {
  id: string;
  from: "user" | "miranda";
  text: string;
  kind?: VerdictKind | "plan";
  productId?: string;
  productTitle?: string;
  priceGbp?: number;
  imageSrc?: string;
  href?: string;
  /** Hex swatch when there is no verified product photo. */
  colour?: string;
  /** Web-sourced item: absolute image, external link. */
  external?: boolean;
};

/** Shape returned by /api/journey. */
type ApiStop = {
  id: string;
  store: string;
  source: "catalogue" | "web";
  title: string;
  priceGbp: number;
  kind: VerdictKind;
  because: string;
  href: string;
  imageUrl?: string;
  colour?: string;
  fabric?: string;
};

type ApiJourney = {
  opener: string;
  closing: string | null;
  stops: ApiStop[];
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function catalogueJourney(want: string): ApiJourney {
  const stops = buildCatalogueJourney(want, DEMO_SHOPPER, "");
  return {
    opener: openerLine(want, stops),
    closing: closingLine(stops),
    stops: stops.map((s) => ({
      id: s.product.id,
      store: s.product.store,
      source: "catalogue" as const,
      title: s.product.title,
      priceGbp: s.product.priceGbp,
      kind: s.verdict.kind,
      because: s.verdict.because,
      href: s.href,
      imageUrl: s.imageUrl,
      colour: s.product.colour,
      fabric: s.product.fabric,
    })),
  };
}

function shopFallbackJourney(want: string): ApiJourney | null {
  if (isDemoBlazerQuery(want)) return null;
  const cards = clientShopCards(want);
  if (cards.length === 0) return null;
  const n = countWord(cards.length);
  return {
    opener: `${n}. Don't browse.`,
    closing: `Done. ${n}. Decide.`,
    stops: cards.map((c) => ({
      id: c.id,
      store: c.store,
      source: "web" as const,
      title: c.title,
      priceGbp: c.priceGbp,
      kind: "suggest" as const,
      because: c.because,
      href: c.href,
      colour: c.colour,
    })),
  };
}

async function fetchJourney(want: string): Promise<ApiJourney> {
  try {
    const ctrl = new AbortController();
    // Web search can take ~22s. Aborting sooner used to drop the cards.
    const timer = setTimeout(() => ctrl.abort(), 28000);
    const res = await fetch("/api/journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: want }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as ApiJourney;
      if (Array.isArray(data.stops) && data.stops.length > 0) return data;
      // Empty stops: clothing asks still get local shop cards; small talk keeps opener.
      const local = shopFallbackJourney(want);
      if (local) return local;
      return data;
    }
  } catch {
    // timeout or network: local cards below
  }
  if (isDemoBlazerQuery(want)) return catalogueJourney(want);
  return shopFallbackJourney(want) ?? catalogueJourney(want);
}

function retailerLabel(href: string, store: string, title: string): string {
  const hay = `${href} ${title}`.toLowerCase();
  if (hay.includes("asos")) return "ASOS";
  if (hay.includes("zara")) return "Zara";
  if (hay.includes("mango")) return "Mango";
  if (hay.includes("hm.com") || hay.includes("h&m")) return "H&M";
  if (hay.includes("cos.com") || hay.includes("cos ")) return "COS";
  if (hay.includes("wilson")) return "Wilson Carter";
  if (hay.includes("nobody")) return "Nobody's Child";
  if (store === "runway") return "Runway";
  if (store === "archive") return "Archive";
  if (store && store !== "web") return store;
  return "Shop";
}

function interleaveStops<T extends { kind: string }>(stops: T[]): T[] {
  const good = stops.filter((s) => s.kind === "suggest");
  const bad = stops.filter((s) => s.kind === "bad");
  const other = stops.filter(
    (s) => s.kind !== "suggest" && s.kind !== "bad",
  );
  const out: T[] = [];
  const max = Math.max(good.length, bad.length);
  for (let i = 0; i < max; i++) {
    if (good[i]) out.push(good[i]);
    if (bad[i]) out.push(bad[i]);
  }
  return [...out, ...other];
}

function PreviewLink({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external: boolean;
  className: string;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function productChatFields(product: Product) {
  return {
    productId: product.id,
    productTitle: product.title,
    priceGbp: product.priceGbp,
    imageSrc: productImageSrc(product),
    href: productPath(product, true),
  };
}

export function ShoppingDemo() {
  const [mirandaOn, setMirandaOn] = useState(true);
  const [input, setInput] = useState(DEMO_QUERY);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greet",
      from: "miranda",
      text: "Miranda. State the garment.",
      kind: "plan",
    },
  ]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [seenVerdicts, setSeenVerdicts] = useState<
    Record<string, Verdict>
  >({});
  const [walking, setWalking] = useState(false);
  const [shopQuery, setShopQuery] = useState<string | null>(null);
  const [shopStops, setShopStops] = useState<ApiStop[] | null>(null);
  const [shopPhase, setShopPhase] = useState<"catalogue" | "looking" | "results">(
    "catalogue",
  );
  const chatEndRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<Record<string, HTMLElement | null>>({});
  const walkGen = useRef(0);
  const lastStopsRef = useRef<ApiStop[]>([]);

  const counts = useMemo(
    () => storeCounts(PRODUCTS, DEMO_SHOPPER),
    [],
  );

  const orderedProducts = useMemo(() => {
    if (!mirandaOn) return PRODUCTS;
    return [...PRODUCTS].sort((a, b) => {
      const rank = (k: VerdictKind) =>
        k === "suggest" ? 0 : k === "meh" ? 1 : 2;
      return (
        rank(judgeProduct(a, DEMO_SHOPPER).kind) -
        rank(judgeProduct(b, DEMO_SHOPPER).kind)
      );
    });
  }, [mirandaOn]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const focusProduct = useCallback((id: string) => {
    setFocusedId(id);
    const el = productRefs.current[id];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, []);

  const runJourney = useCallback(
    async (want: string) => {
      const gen = ++walkGen.current;
      setWalking(true);
      setMirandaOn(true);
      setSeenVerdicts({});
      setFocusedId(null);
      setShopQuery(want);
      setShopPhase("looking");
      productRefs.current = {};

      const lookingId = `look-${gen}`;
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        from: "user",
        text: want,
      };
      setMessages((m) => [
        ...m,
        userMsg,
        {
          id: lookingId,
          from: "miranda",
          kind: "plan",
          text: "Looking.",
        },
      ]);

      const journeyPromise = fetchJourney(want);

      try {
        const journey = await journeyPromise;
        if (gen !== walkGen.current) return;
        const stops = interleaveStops(journey.stops ?? []);
        if (stops.length > 0) lastStopsRef.current = stops;
        setShopStops(stops);
        setShopPhase(stops.length > 0 ? "results" : "catalogue");

        setMessages((m) =>
          m.map((msg) =>
            msg.id === lookingId ? { ...msg, text: journey.opener } : msg,
          ),
        );

        if (stops.length === 0) return;

        await sleep(700);
        if (gen !== walkGen.current) return;

        for (const stop of stops) {
          if (gen !== walkGen.current) return;
          const local = PRODUCTS.find((p) => p.id === stop.id);
          focusProduct(stop.id);
          if (local) {
            setSeenVerdicts((prev) => ({
              ...prev,
              [stop.id]: judgeProduct(local, DEMO_SHOPPER),
            }));
          }
          const external = /^https?:\/\//i.test(stop.href);
          setMessages((m) => [
            ...m,
            {
              id: `s-${stop.id}-${Date.now()}`,
              from: "miranda",
              kind: stop.kind,
              text: stop.because,
              productId: stop.id,
              productTitle: stop.title,
              priceGbp: stop.priceGbp,
              imageSrc: stop.imageUrl ?? (local ? productImageSrc(local) : undefined),
              colour: stop.colour ?? local?.colour,
              href: stop.href || (local ? productPath(local, true) : undefined),
              external,
            },
          ]);
          await sleep(1100);
        }

        if (gen !== walkGen.current) return;
        if (journey.closing) {
          setMessages((m) => [
            ...m,
            {
              id: `done-${Date.now()}`,
              from: "miranda",
              kind: "plan",
              text: journey.closing as string,
            },
          ]);
        }
        setFocusedId(null);
      } finally {
        if (gen === walkGen.current) setWalking(false);
      }
    },
    [focusProduct],
  );

  const runPick = useCallback(
    async (want: string, prior: ApiStop[], index: number) => {
      const stop = prior[index];
      if (!stop) return;
      const gen = ++walkGen.current;
      setWalking(true);
      setMirandaOn(true);
      const opener = pickConfirmLine(index, prior.length, listingLabel(stop), want);
      setShopQuery(opener);
      setShopPhase("results");
      setShopStops(prior);
      const external = /^https?:\/\//i.test(stop.href);
      const local = PRODUCTS.find((p) => p.id === stop.id);

      setMessages((m) => [
        ...m,
        { id: `u-${Date.now()}`, from: "user", text: want },
      ]);

      try {
        await sleep(280);
        if (gen !== walkGen.current) return;
        focusProduct(stop.id);
        setMessages((m) => [
          ...m,
          {
            id: `pick-${gen}`,
            from: "miranda",
            kind: "plan",
            text: opener,
          },
          {
            id: `s-${stop.id}-${gen}`,
            from: "miranda",
            kind: stop.kind,
            text: stop.because,
            productId: stop.id,
            productTitle: stop.title,
            priceGbp: stop.priceGbp,
            imageSrc: stop.imageUrl ?? (local ? productImageSrc(local) : undefined),
            colour: stop.colour ?? local?.colour,
            href: stop.href || (local ? productPath(local, true) : undefined),
            external,
          },
        ]);
      } finally {
        if (gen === walkGen.current) setWalking(false);
      }
    },
    [focusProduct],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const want = input.trim();
    if (!want || walking) return;
    const prior = lastStopsRef.current;
    const index = matchStopPick(want, prior);
    if (index != null) {
      void runPick(want, prior, index);
      return;
    }
    void runJourney(want);
  }

  function onDemo() {
    if (walking) return;
    setInput(DEMO_QUERY);
    void runJourney(DEMO_QUERY);
  }

  function onProductClick(product: Product) {
    if (!mirandaOn) {
      focusProduct(product.id);
      return;
    }
    const verdict = judgeProduct(product, DEMO_SHOPPER);
    focusProduct(product.id);
    setSeenVerdicts((prev) => ({ ...prev, [product.id]: verdict }));
    setMessages((m) => [
      ...m,
      {
        id: `click-${product.id}-${Date.now()}`,
        from: "miranda",
        kind: verdict.kind,
        text: verdict.because,
        ...productChatFields(product),
      },
    ]);
  }

  return (
    <div className="demo">
      <header className="demo__hero">
        <div className="demo__hero-top">
          <div className="demo__brand-row">
            <Image
              src="/miranda-avatar.png"
              alt=""
              width={56}
              height={56}
              className="demo__brand-avatar"
              priority
            />
            <h1 className="demo__brand">Miranda</h1>
          </div>
          <SiteNav active="shop" />
        </div>
        <p className="demo__tag">
          Cold taste. No performance.
        </p>
      </header>

      <div className="demo__stage">
        <aside className="wa" aria-label="WhatsApp-style chat with Miranda">
          <header className="wa__header">
            <Image
              src="/miranda-avatar.png"
              alt=""
              width={40}
              height={40}
              className="wa__avatar"
            />
            <div className="wa__meta">
              <p className="wa__name">Miranda</p>
              <p className="wa__status">
                {walking ? "Looking." : "online"}
              </p>
            </div>
            <button
              type="button"
              className={`miranda-toggle ${mirandaOn ? "miranda-toggle--on" : ""}`}
              onClick={() => setMirandaOn((v) => !v)}
              aria-pressed={mirandaOn}
              disabled={walking}
            >
              {mirandaOn ? "Miranda on" : "Miranda off"}
            </button>
          </header>

          <div className="wa__thread" role="log" aria-live="polite">
            {messages.map((msg) => {
              const isPreview = Boolean(msg.from === "miranda" && msg.href);
              return (
                <div
                  key={msg.id}
                  className={`wa__row wa__row--${msg.from} ${msg.kind ? `wa__row--${msg.kind}` : ""}`}
                >
                  {msg.from === "miranda" && (
                    <Image
                      src="/miranda-avatar.png"
                      alt=""
                      width={28}
                      height={28}
                      className="wa__bubble-avatar"
                    />
                  )}
                  {isPreview && msg.href ? (
                    <PreviewLink
                      href={msg.href}
                      external={Boolean(msg.external)}
                      className={`wa__preview wa__preview--${msg.kind ?? "plan"}`}
                    >
                      {msg.kind === "bad" && (
                        <span className="wa__badge wa__badge--bad">Bad take</span>
                      )}
                      {msg.kind === "suggest" && (
                        <span className="wa__badge wa__badge--suggest">Suggested</span>
                      )}
                      {msg.kind === "meh" && (
                        <span className="wa__badge wa__badge--meh">Meh</span>
                      )}
                      <div className="wa__preview-media">
                        {msg.imageSrc ? (
                          <Image
                            src={msg.imageSrc}
                            alt=""
                            width={220}
                            height={140}
                            className="wa__preview-img"
                            unoptimized={Boolean(msg.external)}
                          />
                        ) : (
                          <div
                            className="wa__preview-swatch"
                            style={
                              {
                                "--swatch":
                                  msg.colour ??
                                  PRODUCTS.find((p) => p.id === msg.productId)
                                    ?.colour ??
                                  "#333",
                              } as CSSProperties
                            }
                          />
                        )}
                      </div>
                      <div className="wa__preview-body">
                        <p className="wa__preview-title">{msg.productTitle}</p>
                        <p className="wa__preview-price">£{msg.priceGbp}</p>
                        <p className="wa__preview-line">{msg.text}</p>
                        <span className="wa__preview-link">Link</span>
                      </div>
                    </PreviewLink>
                  ) : (
                    <div
                      className={`wa__bubble wa__bubble--${msg.from} ${
                        msg.kind ? `wa__bubble--${msg.kind}` : ""
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form className="wa__composer" onSubmit={onSubmit}>
            <button
              type="button"
              className="wa__demo"
              onClick={onDemo}
              disabled={walking}
            >
              Demo
            </button>
            <input
              className="wa__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Black blazer under £80 for dinner"
              disabled={walking}
              aria-label="Message Miranda"
            />
            <button type="submit" className="wa__send" disabled={walking}>
              Send
            </button>
          </form>

          <p className="demo__counts" aria-live="polite">
            {mirandaOn && shopPhase === "results" && shopStops && shopStops.length > 0
              ? `${shopStops.length} stops`
              : mirandaOn
                ? `${counts.suggest} suggested · ${counts.bad} bad takes`
                : "Generic catalogue order"}
            {" · "}
            {DEMO_SHOPPER.name}: £{DEMO_SHOPPER.budgetGbp}, size{" "}
            {DEMO_SHOPPER.size}, no polyester
          </p>
        </aside>

        <section className="demo__shop" aria-label="Fashion shops">
          <div className="demo__shop-head">
            <div>
              <p className="demo__shop-label">Shops</p>
              <h2 className="demo__shop-title">
                {mirandaOn && shopPhase !== "catalogue" ? "Your stops" : "Runway & Archive"}
              </h2>
            </div>
            <p className="demo__shop-sub">
              {mirandaOn && shopPhase === "looking"
                ? `Looking. ${shopQuery ?? ""}`
                : mirandaOn && shopPhase === "results" && shopQuery
                  ? shopQuery
                  : mirandaOn
                    ? "Reordered for you. Bad takes stay badged."
                    : "Seller catalogue order. No taste layer."}
            </p>
          </div>

          {mirandaOn && shopPhase === "looking" ? (
            <p className="demo__shop-looking" aria-live="polite">
              Looking.
            </p>
          ) : mirandaOn && shopPhase === "results" && shopStops && shopStops.length > 0 ? (
            <div className="product-grid product-grid--demo">
              {shopStops.map((stop) => {
                const focused = focusedId === stop.id;
                const external = /^https?:\/\//i.test(stop.href);
                const imageSrc = stop.imageUrl;
                const unoptimised =
                  Boolean(imageSrc) &&
                  (imageSrc!.startsWith("http") || imageSrc!.includes("/api/product-image"));
                const kind = stop.kind;
                const label = retailerLabel(stop.href, stop.store, stop.title);
                const meta =
                  stop.fabric && stop.fabric !== "unlisted" ? stop.fabric : label;
                return (
                  <article
                    key={stop.id}
                    ref={(el) => {
                      productRefs.current[stop.id] = el;
                    }}
                    className={[
                      "product-tile",
                      kind === "suggest" ? "product-tile--suggest" : "",
                      kind === "bad" ? "product-tile--bad" : "",
                      focused ? "product-tile--focus" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <a
                      href={stop.href}
                      className="product-tile__btn"
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      onClick={() => focusProduct(stop.id)}
                    >
                      <div
                        className={[
                          "product-tile__visual",
                          imageSrc ? "product-tile__visual--photo" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={{ "--swatch": stop.colour ?? "#333" } as CSSProperties}
                        aria-hidden
                      >
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt=""
                            fill
                            sizes="(max-width: 900px) 45vw, 180px"
                            className="product-tile__photo"
                            unoptimized={unoptimised}
                          />
                        ) : (
                          <span className="product-tile__silhouette" />
                        )}
                        <span className="product-tile__store">{label}</span>
                      </div>
                      <div className="product-tile__body">
                        <h3 className="product-tile__title">{stop.title}</h3>
                        <p className="product-tile__price">£{stop.priceGbp}</p>
                        <p className="product-tile__meta">{meta}</p>
                        <p className={`product-tile__verdict product-tile__verdict--${kind}`}>
                          {kind === "bad" ? "Bad take" : kind === "suggest" ? "Suggested" : "Meh"}
                        </p>
                        <span className="product-tile__link">Link</span>
                      </div>
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
          <div className="product-grid product-grid--demo">
            {orderedProducts.map((product) => {
              const verdict =
                seenVerdicts[product.id] ??
                (mirandaOn ? judgeProduct(product, DEMO_SHOPPER) : undefined);
              const focused = focusedId === product.id;
              const bad = mirandaOn && verdict?.kind === "bad";
              const suggest = mirandaOn && verdict?.kind === "suggest";
              const imageSrc = productImageSrc(product);

              return (
                <article
                  key={product.id}
                  ref={(el) => {
                    productRefs.current[product.id] = el;
                  }}
                  className={[
                    "product-tile",
                    bad ? "product-tile--bad" : "",
                    suggest ? "product-tile--suggest" : "",
                    focused ? "product-tile--focus" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    className="product-tile__btn"
                    onClick={() => onProductClick(product)}
                  >
                    <div
                      className={[
                        "product-tile__visual",
                        imageSrc ? "product-tile__visual--photo" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={
                        {
                          "--swatch": product.colour,
                        } as CSSProperties
                      }
                      aria-hidden
                    >
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt=""
                          fill
                          sizes="(max-width: 900px) 45vw, 180px"
                          className="product-tile__photo"
                        />
                      ) : (
                        <span className="product-tile__silhouette" />
                      )}
                      <span className="product-tile__store">
                        {product.store}
                      </span>
                    </div>
                    <div className="product-tile__body">
                      <h3 className="product-tile__title">{product.title}</h3>
                      <p className="product-tile__price">
                        £{product.priceGbp}
                      </p>
                      <p className="product-tile__meta">
                        {product.fabric} · {product.size}
                      </p>
                      {mirandaOn && verdict && (
                        <p
                          className={`product-tile__verdict product-tile__verdict--${verdict.kind}`}
                        >
                          {verdict.kind === "bad"
                            ? "Bad take"
                            : verdict.kind === "suggest"
                              ? "Suggested"
                              : "Meh"}
                        </p>
                      )}
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
          )}
        </section>
      </div>
    </div>
  );
}
