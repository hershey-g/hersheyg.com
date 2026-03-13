"use client";

import { COPY } from "@/lib/constants";

export default function ContactSection() {
  return (
    <section id="contact" className="py-14 sm:py-24 sm:pb-14 bg-bg-2/30 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="w-full max-w-[900px] mx-auto">
          <p className="font-mono text-[13px] font-medium tracking-widest uppercase text-accent-lit mb-5 sm:mb-6">
            {COPY.contact.tag}
          </p>

          <h2 className="text-[clamp(28px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-4 sm:mb-5">
            {COPY.contact.heading}
          </h2>

          <p className="text-base sm:text-[17px] text-dim leading-relaxed max-w-[540px] mb-4">
            {COPY.contact.sub}
          </p>

          <p className="text-sm text-dim/70 leading-relaxed max-w-[540px] mb-10 sm:mb-12">
            {COPY.contact.pricing}
          </p>

          {/* Terminal-style CTA */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-intake-modal"))}
            className="inline-flex items-center font-mono text-sm sm:text-base tracking-wide text-white bg-accent rounded-sm px-6 sm:px-7 py-3.5 hover:bg-accent-lit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit active:bg-surface/80 active:scale-[0.98] transition-[color,background-color,transform] mb-10 sm:mb-12"
          >
            <span className="text-accent-lit mr-2" aria-hidden="true">❯</span>
            Start a conversation
            <span
              className="inline-block w-[2px] h-[1em] bg-white/70 ml-2 align-middle"
              style={{ animation: "blink 1s step-end infinite" }}
              aria-hidden="true"
            />
          </button>

          {/* Footer row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[13px] text-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-term-success animate-pulse" />
              Typical reply time: under 24h
            </div>
            <a
              href={`mailto:${COPY.contact.email}?subject=Project%20Inquiry`}
              className="font-mono text-[13px] text-dim hover:text-accent-lit transition-colors"
            >
              {COPY.contact.email} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
