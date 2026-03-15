"use client";

import { useEffect, useId, useMemo, useState } from "react";

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

export default function DemoCallCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].value);
  const [phoneInput, setPhoneInput] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const inputId = useId();

  const normalizedPhoneNumber = useMemo(
    () => normalizePhoneNumber(countryCode, phoneInput),
    [countryCode, phoneInput]
  );

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

  if (isDismissed) {
    return null;
  }

  const isBusy = submitState === "loading";
  const buttonLabel =
    submitState === "loading"
      ? "Calling..."
      : submitState === "success"
        ? "Calling you now..."
        : "Call me";

  return (
    <div
      className={[
        "fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6",
        "transition-all duration-500",
        isFadingOut ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
      ].join(" ")}
    >
      <div className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-line bg-bg-2/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-accent-lit/20 bg-bg px-3 py-3 text-left transition-colors hover:border-accent-lit/50"
            aria-expanded={isOpen}
            aria-controls="demo-call-panel"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-lit/30 bg-accent/40 text-accent-lit">
              <PhoneIcon />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-accent-lit/80">
                AI Demo
              </span>
              <span className="block truncate font-mono text-sm text-text">
                Get a demo call
              </span>
            </span>
          </button>
        </div>

        <div
          id="demo-call-panel"
          className={[
            "grid transition-all duration-300 ease-out",
            isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-3 border-t border-line/80 pt-3">
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
                <p className="font-mono text-xs text-accent-lit">Calling you now...</p>
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
