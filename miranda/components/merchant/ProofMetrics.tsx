"use client";

import type { MerchantProof } from "@/lib/merchantProof";
import { CountUp } from "./CountUp";

export function ProofMetrics({ proof }: { proof: MerchantProof }) {
  const items = [
    {
      value: proof.wastePct,
      suffix: "%",
      label: "of the catalogue is waste for this shopper",
      accent: true,
    },
    {
      value: proof.badTakes,
      suffix: "",
      label: "bad takes she would skip",
      accent: false,
    },
    {
      value: proof.suggested,
      suffix: "",
      label: "items she would wear",
      accent: false,
    },
    {
      value: proof.matchRateOff,
      suffix: "%",
      label: `match rate · Miranda off (top ${proof.viewport})`,
      accent: false,
    },
    {
      value: proof.matchRateOn,
      suffix: "%",
      label: `match rate · Miranda on (top ${proof.viewport})`,
      accent: true,
    },
    {
      value: proof.crossStoreSignals,
      suffix: "",
      label: "signals from other stores used in ranking",
      accent: false,
    },
  ];

  return (
    <div
      className="proof-metrics"
      role="group"
      aria-label="Proof from live catalogue"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={
            item.accent
              ? "proof-metrics__row proof-metrics__row--accent"
              : "proof-metrics__row"
          }
        >
          <p className="proof-metrics__value">
            <CountUp value={item.value} suffix={item.suffix} />
          </p>
          <p className="proof-metrics__label">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
