import Image from "next/image";
import type { Verdict } from "@/lib/types";

export function MirandaPanel({
  verdict,
  productTitle,
}: {
  verdict: Verdict;
  productTitle: string;
}) {
  const badge =
    verdict.kind === "bad"
      ? "Bad take"
      : verdict.kind === "suggest"
        ? "Suggested"
        : "Meh";

  return (
    <aside
      className={`miranda-panel miranda-panel--${verdict.kind}`}
      aria-label="Miranda"
    >
      <header className="miranda-panel__head">
        <Image
          src="/miranda-avatar.png"
          alt=""
          width={36}
          height={36}
          className="miranda-panel__avatar"
        />
        <span className="miranda-panel__name">Miranda</span>
        <span className={`miranda-badge miranda-badge--${verdict.kind}`}>
          {badge}
        </span>
      </header>
      <p className="miranda-panel__item">{productTitle}</p>
      <p className="miranda-panel__because">{verdict.because}</p>
    </aside>
  );
}
