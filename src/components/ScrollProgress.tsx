"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[2px]"
      style={{
        scaleX,
        transformOrigin: "0%",
        background:
          "linear-gradient(to right, var(--color-accent), var(--color-accent-lit), var(--color-accent))",
        boxShadow: "0 0 12px rgba(59, 124, 192, 0.5)",
      }}
    />
  );
}
