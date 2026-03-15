"use client";

import { useEffect, useId, useRef, useState } from "react";

type SubmitState = "idle" | "loading" | "success" | "error";

const COUNTRY_CODES = [
  { label: "🇺🇸 +1", value: "+1" },
  { label: "🇬🇧 +44", value: "+44" },
  { label: "🇮🇱 +972", value: "+972" },
  { label: "🇨🇦 +1", value: "+1" },
  { label: "🇦🇺 +61", value: "+61" },
];

function normalizePhoneNumber(countryCode: string, localNumber: string) {
  const digits = localNumber.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = countryCode.replace(/[^\d+]/g, "");
  return `${normalized}${digits.replace(/^0+/, "")}`;
}

/* ── Icons ────────────────────────────────────── */

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.8 19.8 0 0 1 2.08 4.09 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.87a16 16 0 0 0 6.13 6.13l1.42-1.24a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3 w-3 text-dim"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function RingingPhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 text-accent-lit"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.8 19.8 0 0 1 2.08 4.09 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.87a16 16 0 0 0 6.13 6.13l1.42-1.24a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

/* ── Pulse Rings (success animation) ──────────── */

function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="dcta-ring dcta-ring-1" />
      <span className="dcta-ring dcta-ring-2" />
      <span className="dcta-ring dcta-ring-3" />
    </div>
  );
}

/* ── Constants ────────────────────────────────── */

const TOOLTIP_DISMISS_KEY = "demo-call-tooltip-dismissed";

/* ── Component ────────────────────────────────── */

export default function DemoCallCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].value);
  const [phoneInput, setPhoneInput] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const inputId = useId();
  const helpTextId = useId();
  const errorId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const normalized = normalizePhoneNumber(countryCode, phoneInput);

  /* hydrate tooltip dismiss state */
  useEffect(() => {
    const stored = window.sessionStorage.getItem(TOOLTIP_DISMISS_KEY);
    setTooltipDismissed(stored === "true");
  }, []);

  /* auto-dismiss after success */
  useEffect(() => {
    if (submitState !== "success") return;
    const t1 = setTimeout(() => setIsFadingOut(true), 3500);
    const t2 = setTimeout(() => {
      setIsOpen(false);
      setSubmitState("idle");
      setIsFadingOut(false);
    }, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [submitState]);

  /* focus input on open */
  useEffect(() => {
    if (!isOpen || submitState === "success") return;
    const t = setTimeout(() => {
      const el = document.getElementById(inputId);
      if (el instanceof HTMLInputElement) el.focus();
    }, 250);
    return () => clearTimeout(t);
  }, [inputId, isOpen, submitState]);

  /* close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitState === "loading") return;
    if (!normalized) {
      setSubmitState("error");
      setErrorMessage("Enter a valid phone number.");
      return;
    }
    setSubmitState("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/demo-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: normalized }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null;
      if (!res.ok) throw new Error(payload?.error ?? "Unable to start call.");
      setSubmitState("success");
      setPhoneInput("");
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to start call."
      );
    }
  }

  function handleTooltipDismiss() {
    window.sessionStorage.setItem(TOOLTIP_DISMISS_KEY, "true");
    setTooltipDismissed(true);
  }

  const isBusy = submitState === "loading";

  /* ── Success State ────────────────────────────── */
  if (submitState === "success") {
    return (
      <div
        className={[
          "fixed bottom-[max(6rem,calc(env(safe-area-inset-bottom)+1rem))] right-4 z-50 sm:bottom-8 sm:right-8",
          "transition-all duration-700",
          isFadingOut
            ? "translate-y-3 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100",
        ].join(" ")}
      >
        <div className="dcta-success-enter relative flex flex-col items-center gap-3 rounded-2xl border border-accent-lit/20 bg-bg-2/95 px-8 py-6 shadow-[0_8px_40px_rgba(91,155,213,0.2)] backdrop-blur-xl">
          <div
            className="relative flex h-14 w-14 items-center justify-center"
            aria-hidden="true"
          >
            <PulseRings />
            <span className="dcta-phone-vibrate relative z-10">
              <RingingPhoneIcon />
            </span>
          </div>
          <p className="font-mono text-sm font-medium text-text" role="status" aria-live="polite">
            Your phone is about to ring…
          </p>
          <p className="font-mono text-[11px] text-dim">
            Pick up to hear AI in action
          </p>
        </div>
      </div>
    );
  }

  /* ── Collapsed State (FAB) ────────────────────── */
  if (!isOpen) {
    return (
      <div className="fixed bottom-[max(6rem,calc(env(safe-area-inset-bottom)+1rem))] right-4 z-50 sm:bottom-8 sm:right-8">
        {/* CTA Label (dismissible) */}
        {!tooltipDismissed && (
          <div className="absolute bottom-full right-0 mb-3 flex items-center gap-1.5 rounded-lg border border-line bg-bg-2/95 py-1.5 pl-3 pr-1.5 shadow-lg backdrop-blur-md">
            <span className="whitespace-nowrap font-mono text-[11px] text-accent-lit">
              Get a live AI call
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTooltipDismiss();
              }}
              className="flex h-4 w-4 items-center justify-center rounded-full text-dim/60 transition-colors hover:text-accent-lit"
              aria-label="Dismiss label"
            >
              <CloseIcon />
            </button>
            <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 border-b border-r border-line bg-bg-2/95" />
          </div>
        )}

        {/* Hover tooltip (only when label is dismissed) */}
        {tooltipDismissed && (
          <div
            className={[
              "pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg border border-line bg-bg-2/95 px-3 py-1.5 font-mono text-[11px] text-accent-lit shadow-lg backdrop-blur-md transition-all duration-200",
              showTooltip
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0",
            ].join(" ")}
          >
            Get a live AI call
            <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 border-b border-r border-line bg-bg-2/95" />
          </div>
        )}

        {/* FAB Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className="dcta-fab group relative flex h-14 w-14 items-center justify-center rounded-full border border-accent-lit/25 bg-bg-2/90 text-accent-lit shadow-[0_4px_24px_rgba(91,155,213,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-accent-lit/40 hover:shadow-[0_4px_32px_rgba(91,155,213,0.25)]"
          aria-label="Get an AI demo call"
          aria-expanded="false"
          aria-controls={panelId}
        >
          {/* Shimmer ring */}
          <span className="dcta-shimmer-ring absolute inset-0 rounded-full" />
          {/* Glow pulse */}
          <span className="dcta-glow absolute inset-[-3px] rounded-full" />
          <PhoneIcon className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        </button>


      </div>
    );
  }

  /* ── Expanded State ───────────────────────────── */
  return (
    <div
      className="fixed bottom-[max(6rem,calc(env(safe-area-inset-bottom)+1rem))] right-4 z-50 sm:bottom-8 sm:right-8"
      ref={panelRef}
    >
      <div
        id={panelId}
        className="dcta-panel-enter w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-2xl border border-line bg-bg-2/95 shadow-[0_12px_48px_rgba(0,0,0,0.4),0_0_0_1px_rgba(91,155,213,0.08)] backdrop-blur-xl"
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${panelId}-title`}
        aria-describedby={helpTextId}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-lit/20 bg-accent-lit/10 text-accent-lit">
              <PhoneIcon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p
                id={`${panelId}-title`}
                className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent-lit"
              >
                AI Demo Call
              </p>
              <p className="font-mono text-[10px] text-dim">
                Instant callback — 30 seconds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-dim transition-colors hover:bg-line hover:text-text"
            aria-label="Minimize"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4 pt-3.5">
          <label htmlFor={inputId} className="sr-only">
            Phone number
          </label>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={isBusy}
                className="h-10 w-[4.75rem] appearance-none rounded-lg border border-line bg-bg pl-2.5 pr-6 font-mono text-xs text-text outline-none transition-colors focus:border-accent-lit/50 disabled:opacity-60"
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((opt) => (
                  <option key={`${opt.label}-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <ChevronDown />
              </span>
            </div>
            <input
              id={inputId}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              disabled={isBusy}
              placeholder="(555) 123-4567"
              className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 font-mono text-sm text-text outline-none transition-colors placeholder:text-dim/50 focus:border-accent-lit/50 disabled:opacity-60"
              aria-invalid={submitState === "error"}
              aria-describedby={
                submitState === "error"
                  ? `${errorId} ${helpTextId}`
                  : helpTextId
              }
            />
          </div>

          <button
            type="submit"
            disabled={isBusy || !phoneInput.trim()}
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent-lit/15 font-mono text-[13px] font-medium text-accent-lit transition-all hover:bg-accent-lit/25 disabled:opacity-40"
          >
            {isBusy ? (
              <>
                <span className="dcta-spinner h-3.5 w-3.5 rounded-full border-2 border-accent-lit/30 border-t-accent-lit" />
                Calling…
              </>
            ) : (
              <>
                Call me now
                <ArrowRight />
              </>
            )}
          </button>

          {submitState === "error" && (
            <p
              id={errorId}
              className="font-mono text-[11px] text-term-red"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <p
            id={helpTextId}
            className="text-center font-mono text-[10px] text-dim/60"
          >
            We&apos;ll call once, never store your number
          </p>
        </form>
      </div>

      {/* Collapse back to FAB */}
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-bg-2 px-2.5 py-1 font-mono text-[10px] text-dim transition-colors hover:text-accent-lit"
      >
        <span className="rotate-180">
          <ChevronDown />
        </span>
        minimize
      </button>
    </div>
  );
}
