"use client";

import { useCallback, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import ScrambleReveal from "./ScrambleReveal";
import { COPY } from "@/lib/constants";

type ProofCardData = (typeof COPY.proof.cards)[number];

interface ProofCardProps {
  card: ProofCardData;
}

export default function ProofCard({ card }: ProofCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 8; // max ±4deg
      const rotateX = (0.5 - y) * 8;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      el.style.setProperty("--glow-x", `${x * 100}%`);
      el.style.setProperty("--glow-y", `${y * 100}%`);
      el.style.setProperty("--glow-opacity", "1");
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--glow-opacity", "0");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.3s ease-out", willChange: "transform" } as React.CSSProperties}
      className="relative bg-[rgba(15,30,50,0.4)] border border-line rounded-md overflow-hidden hover:border-[rgba(59,124,192,0.15)] hover:shadow-[0_0_20px_rgba(59,124,192,0.08)] transition-all duration-300"
    >
      {/* Cursor-following glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: "radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(59,124,192,0.10), transparent 60%)",
          opacity: "var(--glow-opacity, 0)",
        }}
        aria-hidden="true"
      />
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
          <ScrambleReveal text={card.metric} delay={card.scrambleDelay + 800} trigger={isInView} />
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
