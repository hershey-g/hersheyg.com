"use client";

import { motion, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";
import TextScramble from "@/components/TextScramble";
import Terminal from "@/components/Terminal";
import TerminalCompact from "@/components/TerminalCompact";
import MagneticButton from "@/components/MagneticButton";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section id="hero" className="relative flex min-h-screen items-center px-6">
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-center">
        {/* Left column */}
        <div>
          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span
              className="h-px bg-accent-lit"
              style={{ animation: 'pulse-line 3s ease infinite' }}
              aria-hidden="true"
            />
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-dim">
              {COPY.hero.eyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-[clamp(2.75rem,5.5vw,4.25rem)] font-extrabold text-white tracking-tight leading-[1.05]"
            style={{ letterSpacing: '-0.035em' }}
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <TextScramble text={COPY.hero.headline} />
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            className="mt-6 text-lg text-body leading-relaxed max-w-[520px]"
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {COPY.hero.sub}
          </motion.p>

          {/* CTA row */}
          <motion.div
            className="flex items-center gap-6 mt-8"
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <MagneticButton>
              <a
                href={`mailto:${COPY.contact.email}`}
                className="group inline-flex items-center gap-2 font-mono text-base tracking-wide text-white bg-accent rounded-sm px-7 py-3.5 hover:bg-accent-lit transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit"
              >
                {COPY.hero.cta}
                <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </a>
            </MagneticButton>

            <a
              href="#proof"
              className="group font-mono text-sm text-dim hover:text-text transition-colors py-2 relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit"
            >
              {COPY.hero.ghost}
              <span className="ml-1" aria-hidden="true">↓</span>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-text transition-all group-hover:w-full" />
            </a>
          </motion.div>

          {/* Terminal compact - mobile only */}
          <motion.div
            className="mt-10 block lg:hidden"
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <TerminalCompact />
          </motion.div>
        </div>

        {/* Right column - Terminal (desktop only) */}
        <motion.div
          className="hidden lg:block"
          initial={noMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <Terminal />
        </motion.div>
      </div>
    </section>
  );
}
