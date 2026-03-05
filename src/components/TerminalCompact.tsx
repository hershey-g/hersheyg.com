"use client";

import { TERMINAL_LINES } from "@/lib/constants";

const DISPLAY_INDICES = [0, 2, 3] as const;

export default function TerminalCompact() {
  return (
    <div className="block lg:hidden">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border border-border-dim bg-bg-card px-4 py-3 font-mono text-xs text-text-dim">
        {DISPLAY_INDICES.map((idx, pos) => {
          const line = TERMINAL_LINES[idx];
          return (
            <span key={idx} className="flex items-center gap-x-3">
              {pos > 0 && (
                <span className="text-accent" aria-hidden="true">
                  *
                </span>
              )}
              <span>
                <span className="text-accent">$</span> {line.prompt}{" "}
                <span className="text-text">{line.output}</span>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
