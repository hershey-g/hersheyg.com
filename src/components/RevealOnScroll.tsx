"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: "default" | "heading";
}

export default function RevealOnScroll({
  children,
  delay = 0,
  className,
  variant = "default",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const prefersReducedMotion = useReducedMotion();

  const initial =
    variant === "heading"
      ? { opacity: 0, x: -24 }
      : { opacity: 0, y: 32 };

  const animate = prefersReducedMotion
    ? { opacity: 1, x: 0, y: 0 }
    : isInView
      ? { opacity: 1, x: 0, y: 0 }
      : initial;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReducedMotion ? false : initial}
      animate={animate}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
