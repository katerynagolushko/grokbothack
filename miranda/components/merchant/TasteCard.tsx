import type { TasteCard as TasteCardData } from "@/lib/merchantProof";

export function TasteCard({ card }: { card: TasteCardData }) {
  return (
    <aside className="taste-card" aria-label="Consented taste card">
      <p className="taste-card__eyebrow">Consented taste card</p>
      <h3 className="taste-card__title">{card.shopperName}</h3>
      <p className="taste-card__note">Filters only. No chat. No private verdicts.</p>
      <dl className="taste-card__grid">
        <div>
          <dt>Size</dt>
          <dd>{card.sizeBand}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{card.budgetBand}</dd>
        </div>
        <div className="taste-card__span">
          <dt>Aesthetics</dt>
          <dd>{card.aesthetics.join(" · ")}</dd>
        </div>
        <div className="taste-card__span">
          <dt>Dealbreakers</dt>
          <dd className="taste-card__deals">{card.dealbreakers.join(" · ")}</dd>
        </div>
      </dl>
    </aside>
  );
}
