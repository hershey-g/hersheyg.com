"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

const GLOW_SIZE = 600;

const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };

export default function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(-GLOW_SIZE);
  const mouseY = useMotionValue(-GLOW_SIZE);

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - GLOW_SIZE / 2);
      mouseY.set(e.clientY - GLOW_SIZE / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  if (!mounted || prefersReducedMotion) return null;

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{
        x: springX,
        y: springY,
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        background:
          "radial-gradient(circle, rgba(110, 231, 183, 0.06) 0%, transparent 70%)",
        borderRadius: "50%",
      }}
    />
  );
}
