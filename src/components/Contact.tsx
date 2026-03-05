"use client";

import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import MagneticButton from "./MagneticButton";

export default function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <RevealOnScroll>
          <SectionTag>{COPY.contact.tag}</SectionTag>
          <SectionHead dim={COPY.contact.headingDim}>
            {COPY.contact.heading}
          </SectionHead>
          <p className="text-lg text-text-dim max-w-xl mx-auto mt-6">
            {COPY.contact.body}
          </p>
          <MagneticButton className="inline-block mt-8">
            <a
              href={`mailto:${COPY.contact.email}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-bg font-semibold text-lg hover:bg-accent/90 transition-colors"
            >
              {COPY.contact.cta}
            </a>
          </MagneticButton>
        </RevealOnScroll>
      </div>
    </section>
  );
}
