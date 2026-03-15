"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Script from "next/script";

const WIDGET_STARTUP_GUARD_MS = 2500;

function restoreTopScroll() {
  if (window.location.hash || window.scrollY === 0) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export default function ElevenLabsWidget() {
  const [isMounted, setIsMounted] = useState(false);
  const startupGuardActiveRef = useRef(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startupGuardActiveRef.current = true;

    const mountRaf = window.requestAnimationFrame(() => {
      restoreTopScroll();
      setIsMounted(true);

      window.requestAnimationFrame(() => {
        restoreTopScroll();
      });
    });

    const handleFocusIn = (event: FocusEvent) => {
      if (!startupGuardActiveRef.current) return;

      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!widgetContainerRef.current?.contains(target)) return;

      window.requestAnimationFrame(() => {
        restoreTopScroll();
      });
    };

    const startupGuardTimeout = window.setTimeout(() => {
      startupGuardActiveRef.current = false;
    }, WIDGET_STARTUP_GUARD_MS);

    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      startupGuardActiveRef.current = false;
      window.cancelAnimationFrame(mountRaf);
      window.clearTimeout(startupGuardTimeout);
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, []);

  return (
    <>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed@0.10.3/dist/index.js"
        strategy="afterInteractive"
      />

      <div
        className="pointer-events-none fixed bottom-28 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:w-[19rem]"
        aria-hidden="true"
      >
        <div className="rounded-2xl border border-line/70 bg-bg-2/92 px-4 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-lit">
            Live Voice Demo
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text">
            Want to hear how an AI agent sounds? Try a live call with AI
            Hershey.
          </p>
        </div>
      </div>

      <div ref={widgetContainerRef} className="fixed bottom-0 right-0 z-50">
        {isMounted
          ? createElement("elevenlabs-convai", {
              "agent-id": process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
              "avatar-orb-color-1": "#5B9BD5",
              "avatar-orb-color-2": "#1E3A5F",
            })
          : null}
      </div>
    </>
  );
}
