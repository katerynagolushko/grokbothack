"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./storefront-morph.module.css";

type Mode = "generic" | "alex" | "bea";

type Tile = {
  id: string;
  src: string;
  label: string;
  price: string;
};

const TILES: Record<Mode, Tile[]> = {
  generic: [
    { id: "g1", src: "/products/asos-blazer.jpg", label: "Blazer", price: "£49" },
    { id: "g2", src: "/products/rw-03.jpg", label: "Logo tee", price: "£32" },
    { id: "g3", src: "/products/rw-05.jpg", label: "Trousers", price: "£68" },
    { id: "g4", src: "/products/rw-08.jpg", label: "Sequin", price: "£110" },
    { id: "g5", src: "/products/mango-blazer.jpg", label: "Jacket", price: "£50" },
    { id: "g6", src: "/products/ar-04.jpg", label: "Knit", price: "£42" },
  ],
  alex: [
    { id: "a1", src: "/products/rw-05.jpg", label: "Wide-leg", price: "£68" },
    { id: "a2", src: "/products/asos-blazer.jpg", label: "Crop blazer", price: "£72" },
    { id: "a3", src: "/products/rw-01.jpg", label: "Wool blazer", price: "£72" },
    { id: "a4", src: "/products/rw-07.jpg", label: "Column knit", price: "£78" },
    { id: "a5", src: "/products/ar-01.jpg", label: "Black shirt", price: "£38" },
    { id: "a6", src: "/products/wilson-charlotte.jpg", label: "Charlotte", price: "£30" },
  ],
  bea: [
    { id: "b1", src: "/products/rw-03.jpg", label: "Logo tee", price: "£32" },
    { id: "b2", src: "/products/rw-08.jpg", label: "Sequin", price: "£110" },
    { id: "b3", src: "/products/rw-04.jpg", label: "Slip", price: "£95" },
    { id: "b4", src: "/products/rw-06.jpg", label: "Hoodie", price: "£45" },
    { id: "b5", src: "/products/mango-blazer.jpg", label: "Mango", price: "£50" },
    { id: "b6", src: "/products/ar-05.jpg", label: "Track", price: "£55" },
  ],
};

const MODE_CYCLE: Mode[] = ["generic", "alex", "bea"];
const DWELL_MS = 1700;

const CHIP: Partial<Record<Mode, string>> = {
  alex: "black · wide-leg · COS",
  bea: "fitted · Nike",
};

export function StorefrontMorph() {
  const [mode, setMode] = useState<Mode>("generic");
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = window.setInterval(() => {
      setMode((prev) => {
        const i = MODE_CYCLE.indexOf(prev);
        return MODE_CYCLE[(i + 1) % MODE_CYCLE.length];
      });
    }, DWELL_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const tiles = TILES[mode];
  const chip = CHIP[mode];

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={[styles.phone, styles[`mode_${mode}`]].join(" ")}
        data-mode={mode}
        aria-label={`Partner storefront for ${mode === "generic" ? "everyone" : mode}`}
      >
        <div className={styles.notch} aria-hidden />
        <div className={styles.screen}>
          <header className={styles.storeHead}>
            <span className={styles.logo}>Zara</span>
            <span className={styles.navDots} aria-hidden>
              ···
            </span>
          </header>

          <div className={styles.chipSlot} aria-live="polite">
            {chip ? (
              <span key={chip} className={styles.chip}>
                {chip}
              </span>
            ) : (
              <span className={styles.chipGhost} />
            )}
          </div>

          <ul className={styles.grid} key={mode}>
            {tiles.map((tile, i) => (
              <li
                key={tile.id}
                className={styles.tile}
                style={{ ["--i" as string]: i }}
              >
                <div className={styles.photo}>
                  <Image
                    src={tile.src}
                    alt=""
                    fill
                    sizes="(min-width: 860px) 160px, 110px"
                    className={styles.img}
                  />
                </div>
                <p className={styles.title}>{tile.label}</p>
                <p className={styles.price}>{tile.price}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.dots} aria-hidden>
        {MODE_CYCLE.map((m) => (
          <span
            key={m}
            className={m === mode ? styles.dotOn : styles.dot}
          />
        ))}
      </div>
    </div>
  );
}
