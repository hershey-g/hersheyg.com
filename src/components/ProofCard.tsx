"use client";

import CountUp from "./CountUp";
import { COPY } from "@/lib/constants";

type ProofCardData = (typeof COPY.proof.cards)[number];

interface ProofCardProps {
  card: ProofCardData;
}

export default function ProofCard({ card }: ProofCardProps) {
  const hasCountUp = 'countTarget' in card;

  return (
    <div className="relative bg-bg-2 border border-line rounded-md px-9 py-11 hover:-translate-y-[3px] hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-accent-lit to-transparent" aria-hidden="true" />

      {/* Label */}
      <span className="font-mono uppercase text-xs tracking-wide text-accent-lit block mb-5">
        {card.label}
      </span>

      {/* Metric */}
      <div className="text-[clamp(2.25rem,4vw,3rem)] font-extrabold text-white tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {hasCountUp && 'countTarget' in card ? (
          <CountUp end={card.countTarget as number} suffix={(card as { countSuffix: string }).countSuffix} />
        ) : (
          card.metric
        )}
      </div>

      {/* Body */}
      <p className="text-base text-body leading-relaxed mt-4">
        {card.body}
      </p>

      {/* Badge */}
      <span className="inline-block mt-5 font-mono text-xs text-dim border border-line rounded-sm px-2.5 py-1 uppercase tracking-normal">
        {card.badge}
      </span>
    </div>
  );
}
