"use client";

import { motion, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";
import TextScramble from "@/components/TextScramble";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center px-6"
    >
      <motion.div
        className="flex flex-col items-center text-center"
        variants={containerVariants}
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
      >
        {/* Role tag */}
        <motion.span
          variants={itemVariants}
          className="mb-6 inline-block rounded-md bg-accent-dim px-3 py-1 font-mono text-xs tracking-wide text-accent"
        >
          {COPY.role}
        </motion.span>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
        >
          <TextScramble text={COPY.headline} />
        </motion.h1>

        {/* Subline */}
        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-xl text-lg text-text-dim"
        >
          {COPY.subline}
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          fill="none"
          className="animate-bounce text-text-muted"
          aria-hidden="true"
        >
          <path
            d="M10 4v12m0 0l-4-4m4 4l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </section>
  );
}
