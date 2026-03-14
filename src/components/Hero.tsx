"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";
import MagneticButton from "@/components/MagneticButton";

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = (delay: number, noMotion: boolean) => ({
  initial: noMotion ? false : { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease },
});

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -40]);

  const headlineParts = COPY.hero.headline.split("\n");

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-svh items-center justify-center px-6 py-28 overflow-hidden"
    >
      {/* Ambient glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          width: 700,
          height: 350,
          top: "calc(50% - 175px)",
          left: "calc(50% - 350px)",
          y: noMotion ? 0 : glowY,
          background:
            "radial-gradient(ellipse at center, rgba(91,155,213,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full"
        style={{ opacity: noMotion ? 1 : contentOpacity, y: noMotion ? 0 : contentY }}
      >
        {/* Eyebrow */}
        <motion.p
          className="font-mono text-[13px] uppercase tracking-widest text-accent-lit mb-8"
          {...fadeUp(0.15, noMotion)}
        >
          {COPY.hero.eyebrow}
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="font-bold text-white tracking-tight"
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
          }}
          {...fadeUp(0.25, noMotion)}
        >
          {headlineParts.map((line, i) => (
            <span key={i}>
              {line}
              {i < headlineParts.length - 1 && <br />}
            </span>
          ))}
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          className="mt-6 text-lg text-body leading-relaxed max-w-[520px]"
          {...fadeUp(0.4, noMotion)}
        >
          {COPY.hero.sub}
        </motion.p>

        {/* CTA */}
        <motion.div className="mt-10" {...fadeUp(0.55, noMotion)}>
          <MagneticButton>
            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-mono text-[14px] tracking-wide text-white rounded-full px-9 py-[14px] transition-colors hover:border-accent-lit/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit"
              style={{
                border: "1px solid rgba(91,155,213,0.35)",
                background: "transparent",
              }}
            >
              {COPY.hero.cta}
            </button>
          </MagneticButton>
        </motion.div>

        {/* Scroll indicator — mobile only */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-1 sm:hidden"
          initial={noMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <span className="text-[10px] font-mono text-dim/40 uppercase tracking-widest">
            scroll
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-dim/30"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
