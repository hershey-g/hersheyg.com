"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

interface TextScrambleProps {
  text: string;
}

export default function TextScramble({ text }: TextScrambleProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(text);
  const [scrambling, setScrambling] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const scramble = useCallback(() => {
    const length = text.length;
    const stepDuration = 25;
    let currentIndex = 0;
    let intervalId: ReturnType<typeof setInterval>;

    setScrambling(true);

    intervalId = setInterval(() => {
      currentIndex++;
      const resolved = Math.min(currentIndex, length);
      let result = text.slice(0, resolved);

      for (let i = resolved; i < length; i++) {
        if (text[i] === '\n') {
          result += '\n';
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayed(result);

      if (resolved >= length) {
        clearInterval(intervalId);
        setDisplayed(text);
        setScrambling(false);
      }
    }, stepDuration);

    return () => {
      clearInterval(intervalId);
      setScrambling(false);
    };
  }, [text]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(text);
      return;
    }

    // Start with scrambled text
    let result = '';
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') result += '\n';
      else result += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    setDisplayed(result);

    // Kill any previous scramble interval
    cleanupRef.current?.();

    // Delay before starting scramble
    const timeout = setTimeout(() => {
      cleanupRef.current = scramble();
    }, 100);

    return () => {
      clearTimeout(timeout);
      cleanupRef.current?.();
    };
  }, [text, prefersReducedMotion, scramble]);

  // Render with line breaks
  const parts = displayed.split('\n');

  return (
    <span aria-label={text.replace(/\n/g, ' ')}>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}
