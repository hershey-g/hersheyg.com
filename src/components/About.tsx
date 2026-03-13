"use client";

import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import Parallax from "./Parallax";

export default function About() {
  return (
    <section id="about" className="bg-bg-2 py-[120px] scroll-mt-20">
      <div className="max-w-[1000px] mx-auto px-6">
        <Parallax speed={0.95}>
          <RevealOnScroll>
            <SectionTag>{COPY.about.tag}</SectionTag>
            <SectionHead bold={COPY.about.heading[0]} dim={COPY.about.heading[1]} />
          </RevealOnScroll>
        </Parallax>

        <div className="mt-10">
          <RevealOnScroll>
            {/* Accent line */}
            <div className="w-12 h-px bg-accent-lit/30 mb-6" aria-hidden="true" />

            {COPY.about.body.map((paragraph, i) => (
              <p
                key={i}
                className="text-lg text-body leading-[1.7] mb-5 last:mb-0 max-w-[560px]"
              >
                {paragraph}
              </p>
            ))}
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
