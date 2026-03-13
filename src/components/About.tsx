"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import Parallax from "./Parallax";

function ScrollRevealPhoto({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const noMotion = !!useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const clipBottom = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const clipPath = useTransform(clipBottom, (v) => `inset(0 0 ${v}% 0)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={noMotion ? {} : { clipPath, scale }}
    >
      {children}
    </motion.div>
  );
}

function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 bg-bg border border-line rounded-lg ${className ?? ""}`}
    >
      {/* Camera icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-dim/40"
        aria-hidden="true"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
      <span className="text-sm text-dim/40 select-none">Headshot here</span>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="bg-bg-2 py-[120px] scroll-mt-20">
      <div className="max-w-[1000px] mx-auto px-6">
        <Parallax speed={0.95}>
          <RevealOnScroll>
            <SectionTag>{COPY.about.tag}</SectionTag>
            <SectionHead bold={COPY.about.heading[0]} dim={COPY.about.heading[1]} />
          </RevealOnScroll>
        </Parallax>

        {/* Desktop two-column grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-16 items-center">
          {/* Text column */}
          <RevealOnScroll>
            {/* Accent line */}
            <div className="w-12 h-px bg-accent-lit/30 mb-6" aria-hidden="true" />

            {COPY.about.body.map((paragraph, i) => (
              <p
                key={i}
                className="text-lg text-body leading-[1.7] mb-5 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </RevealOnScroll>

          {/* Photo column — desktop only */}
          <ScrollRevealPhoto>
            <PhotoPlaceholder className="hidden lg:flex w-[300px] h-[380px]" />
          </ScrollRevealPhoto>
        </div>

        {/* Photo — mobile only, stacks below text */}
        <ScrollRevealPhoto>
          <PhotoPlaceholder className="lg:hidden w-full h-[240px] mt-10" />
        </ScrollRevealPhoto>
      </div>
    </section>
  );
}
