"use client";

import { useState } from "react";
import ScrambleReveal from "./ScrambleReveal";
import { COPY } from "@/lib/constants";

type ProofCardData = (typeof COPY.proof.cards)[number];

interface ProofCardProps {
  card: ProofCardData;
}

export default function ProofCard({ card }: ProofCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="relative bg-[rgba(15,30,50,0.4)] border border-line rounded-md overflow-hidden hover:border-[rgba(59,124,192,0.15)] hover:shadow-[0_0_20px_rgba(59,124,192,0.08)] transition-all duration-300">
      {/* Header strip */}
      <div className="flex items-center gap-2 px-9 py-3 bg-[rgba(59,124,192,0.08)]">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full bg-accent-lit ${
            card.statusDot === "pulse" ? "animate-pulse" : ""
          }`}
          aria-hidden="true"
        />
        <span className="font-mono text-xs uppercase tracking-wide text-dim">
          {card.headerLabel}
        </span>
      </div>

      <div className="px-9 py-8">
        {/* Label */}
        <span className="font-mono uppercase text-xs tracking-wide text-accent-lit block mb-5">
          {card.label}
        </span>

        {/* Metric */}
        <div
          className="text-[clamp(2.25rem,4vw,3rem)] font-extrabold tracking-tighter"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          <ScrambleReveal text={card.metric} delay={card.scrambleDelay} />
        </div>

        {/* Body - collapsible on mobile */}
        <div className="lg:block">
          <p className="text-base text-body leading-relaxed mt-4 max-lg:hidden">
            {card.body}
          </p>
          {/* Mobile collapsible */}
          <div className="lg:hidden mt-4">
            <button
              type="button"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="font-mono text-xs text-dim hover:text-text transition-colors"
            >
              {detailsOpen ? "Hide details" : "Details"}
              <span className="ml-1" aria-hidden="true">
                {detailsOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: detailsOpen ? "200px" : "0px",
                opacity: detailsOpen ? 1 : 0,
              }}
            >
              <p className="text-base text-body leading-relaxed mt-3">
                {card.body}
              </p>
            </div>
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 mt-5 font-mono text-xs text-dim border border-line rounded-sm px-2.5 py-1 uppercase tracking-normal">
          <span className="inline-block w-1 h-1 rounded-full bg-accent-lit" aria-hidden="true" />
          {card.badge}
        </span>
      </div>
    </div>
  );
}
