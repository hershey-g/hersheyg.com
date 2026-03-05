"use client";

import { useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { TERMINAL_LINES } from "@/lib/constants";

interface LineState {
  promptDone: boolean;
  promptChars: number;
  outputDone: boolean;
  outputChars: number;
}

function buildInitialState(skipAnimation: boolean): LineState[] {
  return TERMINAL_LINES.map(() => ({
    promptDone: skipAnimation,
    promptChars: skipAnimation ? Infinity : 0,
    outputDone: skipAnimation,
    outputChars: skipAnimation ? Infinity : 0,
  }));
}

const TYPING_SPEED = 38;
const LINE_PAUSE = 320;
const OUTPUT_PAUSE = 160;

export default function Terminal() {
  const prefersReducedMotion = useReducedMotion();
  const [lines, setLines] = useState<LineState[]>(() =>
    buildInitialState(!!prefersReducedMotion)
  );
  const [allDone, setAllDone] = useState(!!prefersReducedMotion);

  const tick = useCallback(() => {
    setLines((prev) => {
      const next = prev.map((l) => ({ ...l }));

      for (let i = 0; i < TERMINAL_LINES.length; i++) {
        const line = next[i];
        const source = TERMINAL_LINES[i];

        if (!line.promptDone) {
          if (line.promptChars < source.prompt.length) {
            line.promptChars += 1;
            return next;
          }
          line.promptDone = true;
          return next;
        }

        if (!line.outputDone) {
          if (line.outputChars < source.output.length) {
            line.outputChars += 1;
            return next;
          }
          line.outputDone = true;
          return next;
        }
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setLines(buildInitialState(true));
      setAllDone(true);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let stopped = false;

    function schedule() {
      if (stopped) return;

      setLines((prev) => {
        // Determine current phase to pick the right delay
        let delay = TYPING_SPEED;

        for (let i = 0; i < TERMINAL_LINES.length; i++) {
          const line = prev[i];
          const source = TERMINAL_LINES[i];

          if (!line.promptDone) {
            if (line.promptChars >= source.prompt.length) {
              delay = OUTPUT_PAUSE;
            }
            break;
          }
          if (!line.outputDone) {
            if (line.outputChars >= source.output.length) {
              delay = LINE_PAUSE;
            }
            break;
          }
        }

        // Check if all done
        const done = prev.every((l) => l.promptDone && l.outputDone);
        if (done) {
          setAllDone(true);
          return prev;
        }

        timeoutId = setTimeout(() => {
          tick();
          schedule();
        }, delay);

        return prev;
      });
    }

    // Kick off after a short initial delay
    timeoutId = setTimeout(() => {
      tick();
      schedule();
    }, 600);

    return () => {
      stopped = true;
      clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion, tick]);

  return (
    <div className="hidden lg:block">
      <div className="terminal-border rounded-lg">
        {/* Header bar */}
        <div className="flex items-center gap-2 border-b border-border-dim px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-xs text-text-muted">
            hershey@dev ~
          </span>
        </div>

        {/* Body */}
        <div className="bg-bg-card p-4 font-mono text-sm leading-relaxed rounded-b-lg">
          {TERMINAL_LINES.map((source, i) => {
            const state = lines[i];
            const promptText = state
              ? source.prompt.slice(0, Math.min(state.promptChars, source.prompt.length))
              : "";
            const outputText =
              state && state.promptDone
                ? source.output.slice(0, Math.min(state.outputChars, source.output.length))
                : "";

            const showPromptCursor =
              !allDone && state && !state.promptDone && state.promptChars < source.prompt.length;
            const showOutputCursor =
              !allDone &&
              state &&
              state.promptDone &&
              !state.outputDone &&
              state.outputChars < source.output.length;

            // Only render lines that have started typing
            if (state && state.promptChars === 0 && !state.promptDone) {
              // Check if previous line is done
              if (i > 0) {
                const prevState = lines[i - 1];
                if (!prevState || !prevState.outputDone) return null;
              }
              // First line always renders
              if (i > 0) return null;
            }

            return (
              <div key={i} className="mb-1">
                <div>
                  <span className="text-accent">$</span>{" "}
                  <span className="text-text">{promptText}</span>
                  {showPromptCursor && (
                    <span className="animate-pulse text-accent">_</span>
                  )}
                </div>
                {state && state.promptDone && outputText.length > 0 && (
                  <div className="text-text-dim">
                    {outputText}
                    {showOutputCursor && (
                      <span className="animate-pulse text-accent">_</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Final blinking cursor */}
          {allDone && (
            <div>
              <span className="text-accent">$</span>{" "}
              <span className="animate-pulse text-accent">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
