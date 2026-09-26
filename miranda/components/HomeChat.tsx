"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type Stop = {
  id: string;
  store: string;
  title: string;
  priceGbp: number;
  kind: "bad" | "suggest" | "meh";
  because: string;
  href: string;
  imageUrl?: string;
};

type Reply = {
  text: string;
  imageUrl?: string;
  link?: string;
  kind?: string;
  title?: string;
  priceGbp?: number;
};

export function HomeChat() {
  const [text, setText] = useState("Black blazer under £80 for dinner");
  const [stops, setStops] = useState<Stop[] | null>(null);
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Journey failed");
      const data = (await res.json()) as { stops: Stop[]; replies: Reply[] };
      setStops(data.stops);
      setReplies(data.replies);
    } catch {
      setError("That failed. Again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-chat">
      <form onSubmit={onSubmit} className="home-chat__form">
        <label htmlFor="want" className="home-chat__label">
          What do you want?
        </label>
        <textarea
          id="want"
          className="home-chat__input"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. a sharp blazer and trousers, nothing polyester"
        />
        <button type="submit" className="home-chat__submit" disabled={loading}>
          {loading ? "One moment." : "Send"}
        </button>
      </form>

      {error && <p className="home-chat__error">{error}</p>}

      {stops && stops.length === 0 && (
        <p className="home-chat__empty">Nothing worth showing. Raise your standards — or your budget.</p>
      )}

      {stops && stops.length > 0 && (
        <ol className="journey">
          {stops.map((stop, i) => (
            <li key={stop.id} className={`journey__stop journey__stop--${stop.kind}`}>
              <div className="journey__meta">
                <span className="journey__n">{i + 1}</span>
                <span className={`journey__kind journey__kind--${stop.kind}`}>
                  {stop.kind === "bad" ? "Skip" : stop.kind === "suggest" ? "Stop" : "Maybe"}
                </span>
              </div>
              <a href={stop.href} className="journey__card">
                <Image
                  src={stop.imageUrl ?? `/products/${stop.id}.jpg`}
                  alt=""
                  width={120}
                  height={80}
                  className="journey__thumb"
                  unoptimized={Boolean(stop.imageUrl && /^https?:/.test(stop.imageUrl))}
                />
                <span className="journey__card-text">
                  <span className="journey__link">
                    {stop.title} — £{stop.priceGbp}
                  </span>
                  <span className="journey__because">{stop.because}</span>
                </span>
              </a>
              <p className="journey__store">/shop/{stop.store}</p>
            </li>
          ))}
        </ol>
      )}

      {replies && (
        <details className="journey-raw">
          <summary>WhatsApp-style replies</summary>
          <pre>{JSON.stringify(replies, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
