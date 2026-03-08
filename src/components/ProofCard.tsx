"use client";

import { useCallback, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import ScrambleReveal from "./ScrambleReveal";
import { COPY } from "@/lib/constants";

type ProofCardData = (typeof COPY.proof.cards)[number];

interface ProofCardProps {
  card: ProofCardData;
}

export default function ProofCard({ card }: ProofCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
      el.style.setProperty("--glow-opacity", "1");
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--glow-opacity", "0");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-bg border border-line rounded-md overflow-hidden hover:border-[rgba(59,124,192,0.15)] hover:shadow-[0_0_20px_rgba(59,124,192,0.08)] transition-[border-color,box-shadow] duration-300"
    >
      {/* Cursor-following glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: "radial-gradient(300px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(59,124,192,0.10), transparent 60%)",
          opacity: "var(--glow-opacity, 0)",
        }}
        aria-hidden="true"
      />
      {/* Header strip */}
      <div className="flex items-center gap-2 px-5 sm:px-6 md:px-9 py-3 bg-[rgba(59,124,192,0.08)]">
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

      <div className="px-5 py-5 sm:px-6 sm:py-6 md:px-9 md:py-8">
        {/* Label */}
        <span className="font-mono uppercase text-xs tracking-wide text-accent-lit block mb-4 sm:mb-5">
          {card.label}
        </span>

        {/* Metric */}
        <div
          className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tighter"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          <ScrambleReveal text={card.metric} delay={card.scrambleDelay + 800} trigger={isInView} />
        </div>

        {/* Body — always visible */}
        <p className="text-sm sm:text-base text-body leading-relaxed mt-3 sm:mt-4">
          {card.body}
        </p>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 mt-4 sm:mt-5 font-mono text-xs text-dim border border-line rounded-sm px-2.5 py-1 uppercase tracking-normal">
          <span className="inline-block w-1 h-1 rounded-full bg-accent-lit" aria-hidden="true" />
          {card.badge}
        </span>
      </div>
    </div>
  );
}
