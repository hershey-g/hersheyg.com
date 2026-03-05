"use client";

import { useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

const CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

interface TextScrambleProps {
  text: string;
}

export default function TextScramble({ text }: TextScrambleProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(prefersReducedMotion ? text : "");

  const scramble = useCallback(() => {
    const duration = 1500;
    const length = text.length;
    let start: number | null = null;
    let frameId: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      const resolved = Math.floor(progress * length);
      let result = text.slice(0, resolved);

      for (let i = resolved; i < length; i++) {
        result += CHARS[Math.floor(Math.random() * CHARS.length)];
      }

      setDisplayed(result);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    }

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [text]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(text);
      return;
    }
    return scramble();
  }, [text, prefersReducedMotion, scramble]);

  return <span className="font-mono">{displayed}</span>;
}
