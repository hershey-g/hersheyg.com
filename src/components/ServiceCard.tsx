"use client";

import { useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
}

const icons: Record<string, React.ReactNode> = {
  layout: (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v12" />
    </svg>
  ),
  server: (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  layers: (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  terminal: (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 17l6-5-6-5" />
      <path d="M12 19h8" />
    </svg>
  ),
};

export default function ServiceCard({
  title,
  description,
  icon,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState<{ x: number; y: number } | null>(
    null,
  );
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
      className="relative overflow-hidden bg-bg-card border border-border rounded-lg p-6 hover:border-accent/30 transition-colors"
    >
      {glowPos && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(320px circle at ${glowPos.x}px ${glowPos.y}px, var(--color-glow), transparent 70%)`,
          }}
        />
      )}
      <div className="relative">
        <span className="text-accent">{icons[icon]}</span>
        <h3 className="text-lg font-semibold text-text mt-4">{title}</h3>
        <p className="text-sm text-text-dim mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
