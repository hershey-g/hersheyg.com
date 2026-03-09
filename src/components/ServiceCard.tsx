"use client";

import { useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface ServiceCardProps {
  num: string;
  title: string;
  body: string;
  tags: string[];
}

export default function ServiceCard({ num, title, body, tags }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
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
    [prefersReducedMotion],
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
      className="group relative overflow-hidden bg-bg p-5 sm:p-6 lg:p-8 border border-line rounded-md hover:border-[rgba(59,124,192,0.15)] hover:shadow-[0_0_20px_rgba(59,124,192,0.08)] transition-[border-color,box-shadow] duration-300 h-full"
    >
      {/* Cursor glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: "radial-gradient(300px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(59,124,192,0.1), transparent 60%)",
          opacity: "var(--glow-opacity, 0)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col h-full">
        <span className="font-mono text-xs text-dim mb-3 sm:mb-6 block">{num}</span>
        <h3 className="font-semibold text-white text-md sm:text-lg mb-2 sm:mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-body leading-relaxed">{body}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-4 sm:pt-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-xs text-dim border border-line rounded-sm px-2 py-0.5 group-hover:text-body group-hover:border-white/10 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
