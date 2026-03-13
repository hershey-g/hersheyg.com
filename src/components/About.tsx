"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import RevealOnScroll from "./RevealOnScroll";

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  // Desktop: clip-path reveal left→right
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
  );

  // Mobile: clip-path reveal bottom→up
  const mobileClipPath = useTransform(
    scrollYProgress,
    [0, 0.8],
    ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]
  );

  return (
    <section id="about" className="py-14 sm:py-24 scroll-mt-20" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-16 items-start">
          {/* Text column */}
          <div>
            <RevealOnScroll>
              <SectionTag>{COPY.about.tag}</SectionTag>

              <h2 className="mt-4 text-[clamp(1.75rem,3.5vw,2.5rem)] tracking-tight leading-[1.15]">
                <span className="text-white font-bold block">{COPY.about.heading[0]}</span>
                <span className="text-dim font-normal block">{COPY.about.heading[1]}</span>
              </h2>

              {/* Accent line */}
              <div className="w-12 h-px bg-accent-lit/30 mt-6 mb-6" aria-hidden="true" />

              {/* Body paragraphs */}
              {COPY.about.body.map((paragraph, i) => (
                <p key={i} className="text-base text-body leading-relaxed mb-4 last:mb-0 max-w-[560px]">
                  {paragraph}
                </p>
              ))}
            </RevealOnScroll>
          </div>

          {/* Photo column - desktop: bleeds right, clip-path reveal */}
          <div className="relative hidden lg:block">
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-[280px] overflow-hidden rounded-l-md"
              style={prefersReducedMotion ? {} : { clipPath }}
            >
              {/* Photo placeholder: gradient bg + HG monogram + grain */}
              <div className="relative w-full h-[400px] bg-gradient-to-br from-accent/30 via-bg-2 to-accent/10 about-photo-grain">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white/[0.06] tracking-tight select-none">
                    HG
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Photo - mobile: full-width bleed below bio, clip bottom→up */}
          <div className="lg:hidden -mx-6">
            <motion.div
              className="overflow-hidden"
              style={prefersReducedMotion ? {} : { clipPath: mobileClipPath }}
            >
              <div className="relative w-full h-[240px] bg-gradient-to-br from-accent/30 via-bg-2 to-accent/10 about-photo-grain">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white/[0.06] tracking-tight select-none">
                    HG
                  </span>
                </div>
                {/* Gradient mask on top edge */}
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-bg to-transparent" aria-hidden="true" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
