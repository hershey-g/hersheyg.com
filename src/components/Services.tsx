"use client";

import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import Parallax from "./Parallax";

export default function Services() {
  return (
    <section id="services" className="py-[120px] bg-bg-2">
      <div className="max-w-[900px] mx-auto px-6 sm:px-12">
        {/* Header */}
        <Parallax speed={0.95}>
          <RevealOnScroll>
            <SectionTag>{COPY.services.tag}</SectionTag>
            <div className="mt-4">
              <SectionHead bold={COPY.services.heading[0]} dim={COPY.services.heading[1]} />
            </div>
            <p className="mt-4 text-base text-body leading-[1.65] max-w-[620px]">
              {COPY.services.qualifyingIntro}
            </p>
          </RevealOnScroll>
        </Parallax>

        {/* Service rows */}
        <div className="mt-10">
          {COPY.services.cards.map((card, index) => (
            <RevealOnScroll key={card.num} delay={index * 0.1}>
              <div
                className={`group cursor-default hover:bg-accent/[0.04] transition-colors duration-200 grid gap-x-6 py-8 border-t border-line${
                  index === COPY.services.cards.length - 1 ? " border-b" : ""
                }`}
                style={{ gridTemplateColumns: "56px 1fr" }}
              >
                {/* Row number */}
                <span className="font-mono text-[13px] text-dim pt-1 transition-colors group-hover:text-accent-lit">
                  {card.num}
                </span>

                {/* Row content */}
                <div>
                  <h3 className="text-lg font-semibold text-white leading-[1.35] mb-[10px]">
                    {card.title}
                  </h3>
                  <p className="text-base text-body leading-[1.65] max-w-[620px]">
                    {card.body}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
