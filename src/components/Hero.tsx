"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COPY, HERO_VARIANTS } from "@/lib/constants";
import TextScramble from "@/components/TextScramble";
import Terminal from "@/components/Terminal";
import MagneticButton from "@/components/MagneticButton";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  // Deterministic initial value avoids hydration mismatch (#418).
  // useEffect swaps in a random variant on mount; TextScramble masks the change.
  const [variantIndex, setVariantIndex] = useState(0);
  const initializedRef = useRef(false);
  const [hasRotated, setHasRotated] = useState(false);

  useEffect(() => {
    if (!initializedRef.current) {
      setVariantIndex(Math.floor(Math.random() * HERO_VARIANTS.length));
      initializedRef.current = true;
    }

    const interval = setInterval(() => {
      setHasRotated(true);
      setVariantIndex((prev) => (prev + 1) % HERO_VARIANTS.length);
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  const variant = HERO_VARIANTS[variantIndex];

  return (
    <section id="hero" className="relative flex min-h-[85vh] lg:min-h-screen items-center pt-28 pb-16 lg:pt-0 lg:pb-0 px-6">
      {/* Geometric decorations */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full border border-accent-lit/5 hidden lg:block" aria-hidden="true" />
      <div className="absolute bottom-32 right-40 w-16 h-16 rounded-full border border-accent-lit/10 hidden lg:block" aria-hidden="true" />

      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-center">
        {/* Left column */}
        <div className="flex flex-col">
          {/* Eyebrow */}
          <motion.div
            className="group hidden sm:flex items-center gap-3 mb-8 sm:mb-10"
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span
              className="h-px w-8 bg-accent-lit transition-[width] duration-300 ease-out group-hover:w-12"
              aria-hidden="true"
            />
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
              {COPY.hero.eyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <div className="border-l-2 border-accent-lit/15 pl-4">
            <span className="font-mono text-[10px] text-dim/30 mb-2 block hidden sm:block">001</span>
            <motion.h1
              className="text-[clamp(2.25rem,8vw,4.25rem)] lg:text-[clamp(2.75rem,5.5vw,4.25rem)] font-extrabold text-white tracking-tight leading-[1.08]"
              style={{ letterSpacing: '-0.035em' }}
              initial={noMotion ? false : { y: 12 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <TextScramble key={variantIndex} text={variant.headline} />
            </motion.h1>
          </div>

          {/* Sub-copy — mobile version (1 short line) */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`mobile-${variantIndex}`}
              className="mt-6 sm:mt-8 text-base text-body leading-relaxed max-w-[520px] sm:hidden"
              initial={noMotion ? false : hasRotated ? { opacity: 0, y: 10 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={noMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              transition={
                hasRotated
                  ? { duration: noMotion ? 0 : 0.4, ease: [0.25, 0.1, 0.25, 1] }
                  : { delay: 0.4, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
              }
            >
              {variant.mobileSub}
            </motion.p>
          </AnimatePresence>

          {/* Sub-copy — desktop version (full paragraph) */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desktop-${variantIndex}`}
              className="mt-6 sm:mt-8 text-base sm:text-lg text-body leading-relaxed max-w-[520px] hidden sm:block"
              initial={noMotion ? false : hasRotated ? { opacity: 0, y: 10 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={noMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              transition={
                hasRotated
                  ? { duration: noMotion ? 0 : 0.4, ease: [0.25, 0.1, 0.25, 1] }
                  : { delay: 0.4, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
              }
            >
              {variant.sub}
            </motion.p>
          </AnimatePresence>

          {/* CTA row */}
          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 mt-8 sm:mt-10"
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <MagneticButton>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-intake-modal"))}
                className="inline-flex items-center justify-center font-mono text-sm sm:text-base tracking-wide text-white bg-accent rounded-sm px-6 sm:px-7 py-3.5 hover:bg-accent-lit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit active:scale-[0.98] transition-[color,background-color,transform]"
              >
                <span className="text-accent-lit mr-2" aria-hidden="true">❯</span>
                {COPY.hero.cta}
                <span
                  className="inline-block w-[2px] h-[1em] bg-white/70 ml-2 align-middle"
                  style={{ animation: "blink 1s step-end infinite" }}
                  aria-hidden="true"
                />
              </button>
            </MagneticButton>
          </motion.div>

          {/* Scroll indicator - mobile only */}
          <motion.div
            className="mt-auto pt-8 pb-4 flex justify-center sm:hidden"
            initial={noMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <div className="scroll-indicator flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-dim/40 uppercase tracking-widest">scroll</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dim/30">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </motion.div>

        </div>

        {/* Right column - Terminal (desktop only) */}
        <motion.div
          className="hidden lg:block"
          initial={noMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Terminal />
        </motion.div>
      </div>
    </section>
  );
}
