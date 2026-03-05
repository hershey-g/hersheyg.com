"use client";

import { useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface ServiceCardProps {
  num: string;
  title: string;
  body: string;
  tags: string[];
}

export default function ServiceCard({ num, title, body, tags }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState<{ x: number; y: number } | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      setGlowPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [prefersReducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    setGlowPos(null);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden bg-bg p-8 hover:bg-bg-2 transition-colors"
    >
      {/* Cursor glow */}
      {glowPos && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(300px circle at ${glowPos.x}px ${glowPos.y}px, rgba(59,124,192,0.1), transparent 60%)`,
          }}
        />
      )}

      <div className="relative">
        <span className="font-mono text-xs text-dim mb-6 block">{num}</span>
        <h3 className="font-semibold text-white text-lg mb-3">{title}</h3>
        <p className="text-base text-body leading-relaxed">{body}</p>
        <div className="flex flex-wrap gap-1.5 mt-5">
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
