"use client";

import { useEffect, useId, useState } from "react";

type SubmitState = "idle" | "loading" | "success" | "error";

const COUNTRY_CODES = [
  { label: "US +1", value: "+1" },
  { label: "UK +44", value: "+44" },
  { label: "IL +972", value: "+972" },
  { label: "CA +1", value: "+1" },
  { label: "AU +61", value: "+61" },
];

function normalizePhoneNumber(countryCode: string, localNumber: string) {
  const digits = localNumber.replace(/\D/g, "");
  if (!digits) return "";

  const normalizedCountryCode = countryCode.replace(/[^\d+]/g, "");
  const withoutLeadingZeros = digits.replace(/^0+/, "");
  return `${normalizedCountryCode}${withoutLeadingZeros}`;
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
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
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function RingingPhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.8 19.8 0 0 1 2.08 4.09 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.87a16 16 0 0 0 6.13 6.13l1.42-1.24a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92Z" />
      <path d="M15.5 4.5a4.5 4.5 0 0 1 0 6.36" className="demo-call-ring-wave" />
      <path d="M17.8 2.2a7.75 7.75 0 0 1 0 10.96" className="demo-call-ring-wave demo-call-ring-wave-delay" />
    </svg>
  );
}

const DISMISS_STORAGE_KEY = "demo-call-cta-dismissed";

export default function DemoCallCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].value);
  const [phoneInput, setPhoneInput] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const inputId = useId();
  const normalizedPhoneNumber = normalizePhoneNumber(countryCode, phoneInput);

  useEffect(() => {
    const storedValue = window.sessionStorage.getItem(DISMISS_STORAGE_KEY);
    if (storedValue === "true") {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (submitState !== "success") return;

    const fadeTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, 4200);

    const dismissTimer = window.setTimeout(() => {
      setIsDismissed(true);
    }, 5000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [submitState]);

  useEffect(() => {
    if (!isOpen || submitState === "success") return;

    const focusTimer = window.setTimeout(() => {
      const input = document.getElementById(inputId);
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 180);

    return () => window.clearTimeout(focusTimer);
  }, [inputId, isOpen, submitState]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedPhoneNumber) {
      setSubmitState("error");
      setErrorMessage("Enter a valid phone number.");
      return;
    }

    setSubmitState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/demo-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: normalizedPhoneNumber }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to initiate your call.");
      }

      setSubmitState("success");
      setPhoneInput("");
      setIsOpen(true);
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to initiate your call."
      );
    }
  }

  function handleDismiss() {
    window.sessionStorage.setItem(DISMISS_STORAGE_KEY, "true");
    setIsDismissed(true);
  }

  if (isDismissed) {
    return null;
  }

  const isBusy = submitState === "loading";
  const buttonLabel =
    submitState === "loading"
      ? "Calling..."
      : submitState === "success"
        ? "Phone ringing..."
        : "Call me";

  return (
    <div
      className={[
        "fixed bottom-20 right-3 z-50 sm:bottom-6 sm:right-6",
        "transition-all duration-500",
        isFadingOut ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[1.35rem] bg-[linear-gradient(120deg,rgba(91,155,213,0.14),rgba(91,155,213,0.8),rgba(91,155,213,0.12))] p-px shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
          "transition-[width,transform,opacity] duration-300 ease-out",
          !isOpen ? "demo-call-pill-glow w-auto" : "demo-call-panel-enter w-[min(calc(100vw-1.5rem),22rem)] sm:w-[22rem]",
        ].join(" ")}
      >
        <div className="relative overflow-hidden rounded-[calc(1.35rem-1px)] border border-line bg-bg-2/95 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setIsOpen((open) => !open);
              if (submitState === "error") {
                setSubmitState("idle");
                setErrorMessage("");
              }
            }}
            className={[
              "relative group flex min-w-0 items-center gap-2.5 text-left transition-all sm:gap-3",
              isOpen
                ? "w-full rounded-[1.35rem] border-b border-line/80 bg-transparent px-4 py-3.5 pr-12 hover:border-line/80"
                : "rounded-[1.35rem] bg-bg/95 px-3 py-2.5 pr-4 shadow-[0_0_0_1px_rgba(91,155,213,0.18),0_0_24px_rgba(91,155,213,0.18)] hover:shadow-[0_0_0_1px_rgba(91,155,213,0.32),0_0_32px_rgba(91,155,213,0.24)] sm:px-4 sm:py-3",
            ].join(" ")}
            aria-expanded={isOpen}
            aria-controls="demo-call-panel"
          >
            <span
              className={[
                "flex items-center justify-center rounded-full border border-accent-lit/30 bg-accent/40 text-accent-lit",
                isOpen ? "h-10 w-10" : "h-8 w-8 sm:h-9 sm:w-9",
              ].join(" ")}
            >
              <PhoneIcon />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-accent-lit/80 sm:text-[11px]">
                AI Demo
              </span>
              <span className="block truncate font-mono text-xs text-text sm:text-sm">
                {isOpen ? "Get a live callback" : "Talk to the AI"}
              </span>
            </span>
            {!isOpen ? (
              <span
                className="demo-call-pulse absolute inset-0 rounded-[1.35rem]"
                aria-hidden="true"
              />
            ) : null}
          </button>

          {isOpen ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-bg/70 text-dim transition-colors hover:border-accent-lit/40 hover:text-accent-lit"
              aria-label="Dismiss demo call widget"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>

        <div
          id="demo-call-panel"
          className={[
            "grid transition-all duration-300 ease-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4 pt-3">
              <div className="pr-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-lit/80">
                  Instant callback
                </p>
                <p className="mt-1 font-mono text-xs text-dim">
                  Drop your number and the AI calls right away.
                </p>
              </div>

              <label htmlFor={inputId} className="block font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                Your phone
              </label>

              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  disabled={isBusy || submitState === "success"}
                  className="w-24 rounded-lg border border-line bg-bg px-2 py-3 font-mono text-sm text-text outline-none transition-colors focus:border-accent-lit/60 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label="Country code"
                >
                  {COUNTRY_CODES.map((option) => (
                    <option key={`${option.label}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  id={inputId}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  disabled={isBusy || submitState === "success"}
                  placeholder="555 123 4567"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-3 font-mono text-sm text-text outline-none transition-colors placeholder:text-dim focus:border-accent-lit/60 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <button
                type="submit"
                disabled={isBusy || submitState === "success"}
                className="w-full rounded-lg border border-accent-lit/40 bg-accent px-3 py-3 font-mono text-sm text-text transition-colors hover:border-accent-lit/70 hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {buttonLabel}
              </button>

              {submitState === "success" ? (
                <div className="flex items-center gap-2 rounded-lg border border-accent-lit/25 bg-accent-lit/10 px-3 py-2.5 font-mono text-xs text-accent-lit">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-lit/25 bg-accent-lit/10">
                    <RingingPhoneIcon />
                  </span>
                  <span>Phone ringing now. Keep it nearby.</span>
                </div>
              ) : null}

              {submitState === "error" ? (
                <p className="font-mono text-xs text-term-red">{errorMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
