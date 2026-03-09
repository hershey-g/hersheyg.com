"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";

const lines = COPY.terminal.lines;

// Timing constants
const CMD_PAUSE = 600;
const OUTPUT_PAUSE = 120;
const BLANK_PAUSE = 200;

function getLineDelay(type: string) {
  if (type === "cmd") return CMD_PAUSE;
  if (type === "blank") return BLANK_PAUSE;
  return OUTPUT_PAUSE;
}

export default function Terminal() {
  const prefersReducedMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(
    prefersReducedMotion ? lines.length : 0
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleCount(lines.length);
      return;
    }

    let current = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function showNext() {
      if (current >= lines.length) return;
      const line = lines[current];
      const delay = getLineDelay(line.type);

      timeoutId = setTimeout(() => {
        current++;
        setVisibleCount(current);
        showNext();
      }, delay);
    }

    // Start after 1.4s hero delay
    timeoutId = setTimeout(() => {
      showNext();
    }, 1400);

    return () => clearTimeout(timeoutId);
  }, [prefersReducedMotion]);

  return (
    <div
      className="terminal-border rounded-md bg-bg-2/50 backdrop-blur-[12px] border border-line"
      aria-hidden="true"
    >
      {/* Title bar */}
      <div className="flex items-center px-4 py-3 border-b border-line">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-term-red/60" />
          <span className="h-3 w-3 rounded-full bg-term-yellow/60" />
          <span className="h-3 w-3 rounded-full bg-term-green/60" />
        </div>
        <span className="flex-1 text-center font-mono text-xs text-dim">
          {COPY.terminal.title}
        </span>
        <div className="w-[52px]" />
      </div>

      {/* Body */}
      <div className="p-4 font-mono text-sm leading-relaxed">
        {lines.map((line, i) => {
          if (i >= visibleCount) return null;

          if (line.type === "blank") {
            return <div key={i} className="h-4" />;
          }

          if (line.type === "cursor") {
            return (
              <div key={i}>
                <span className="text-term-green">$</span>{" "}
                <span
                  className="inline-block w-2 h-4 bg-term-green align-middle"
                  style={{ animation: "blink 1s step-end infinite" }}
                />
              </div>
            );
          }

          if (line.type === "cmd") {
            const text = (line as { type: "cmd"; text: string }).text;
            const afterPrompt = text.startsWith("$ ") ? text.slice(2) : text;
            return (
              <div key={i}>
                <span className="text-term-green">$</span>{" "}
                <span className="text-text">{afterPrompt}</span>
              </div>
            );
          }

          if (line.type === "comment") {
            return (
              <div key={i} className="text-dim italic">
                {(line as { type: "comment"; text: string }).text}
              </div>
            );
          }

          if (line.type === "kv") {
            const kv = line as {
              type: "kv";
              key: string;
              value: string;
              color: string;
            };
            const valueColor =
              kv.color === "orange" ? "text-term-orange" : "text-term-success";
            const padding = " ".repeat(Math.max(1, 14 - kv.key.length));
            return (
              <div key={i}>
                <span className="text-accent-lit">{"  "}{kv.key}</span>
                {padding}
                <span className={valueColor}>{kv.value}</span>
              </div>
            );
          }

          if (line.type === "out") {
            return (
              <div key={i} className="text-body">
                {(line as { type: "out"; text: string }).text}
              </div>
            );
          }

          if (line.type === "success") {
            return (
              <div key={i} className="text-term-success">
                {(line as { type: "success"; text: string }).text}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
