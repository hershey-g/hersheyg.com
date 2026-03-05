"use client";

import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import RevealOnScroll from "./RevealOnScroll";
import MagneticButton from "./MagneticButton";

export default function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <SectionTag>{COPY.contact.tag}</SectionTag>
        </RevealOnScroll>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          {/* Left column */}
          <RevealOnScroll>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-white tracking-tighter leading-tight">
              {COPY.contact.heading}
            </h2>
            <p className="text-base text-body leading-relaxed max-w-[440px] mt-6 mb-9">
              {COPY.contact.sub}
            </p>
            <MagneticButton>
              <a
                href={`mailto:${COPY.contact.email}`}
                className="group relative inline-flex items-center gap-2 font-mono text-base font-medium text-white bg-accent rounded-sm px-7 py-4 border border-white/5 overflow-hidden hover:bg-accent-lit hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit"
                style={{ boxShadow: '0 0 0 0 rgba(59, 124, 192, 0)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(59, 124, 192, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 0 rgba(59, 124, 192, 0)';
                }}
              >
                <span className="absolute inset-0 bg-accent-lit scale-0 group-hover:scale-100 rounded-full transition-transform duration-500 origin-center" aria-hidden="true" />
                <span className="relative z-10">{COPY.contact.email}</span>
                <span className="relative z-10 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
                  →
                </span>
              </a>
            </MagneticButton>
          </RevealOnScroll>

          {/* Right column - aside */}
          <RevealOnScroll delay={0.12}>
            <aside className="font-mono text-sm text-dim text-left lg:text-right leading-loose whitespace-pre-line">
              {COPY.contact.aside}
            </aside>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
