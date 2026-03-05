"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const CHARS = "0123456789,+$#&!@%ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FRAME_MS = 35;
const TOTAL_FRAMES = 18;

function scramble(text: string): string {
  return text
    .split("")
    .map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
    .join("");
}

interface ScrambleRevealProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function ScrambleReveal({ text, delay = 0, className }: ScrambleRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(() =>
    prefersReducedMotion ? text : scramble(text)
  );
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!isInView || prefersReducedMotion || revealed) return;

    const timeout = setTimeout(() => {
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        const chars = text.split("").map((char, i) => {
          if (char === " ") return " ";
          const lockAt = Math.floor((i / text.length) * TOTAL_FRAMES);
          if (frame >= lockAt) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        });
        setDisplay(chars.join(""));

        if (frame >= TOTAL_FRAMES) {
          clearInterval(interval);
          setDisplay(text);
          setRevealed(true);
        }
      }, FRAME_MS);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, prefersReducedMotion, text, delay, revealed]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">
        {display.split("").map((char, i) => {
          const isLocked = char === text[i];
          return (
            <span
              key={i}
              className={
                isLocked
                  ? "text-white opacity-100 transition-opacity duration-150"
                  : "text-accent-lit opacity-50"
              }
            >
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}
