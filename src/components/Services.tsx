"use client";

import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import ServiceCard from "./ServiceCard";

export default function Services() {
  return (
    <section id="services" className="py-14 sm:py-24 bg-bg-2/30">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <SectionTag>{COPY.services.tag}</SectionTag>
          <div className="mt-4">
            <SectionHead bold={COPY.services.heading[0]} dim={COPY.services.heading[1]} />
          </div>
        </RevealOnScroll>

        {/* Responsive grid: stacked on mobile, 3-col on desktop */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {COPY.services.cards.map((card, index) => (
            <RevealOnScroll key={card.num} delay={index * 0.12} className="h-full">
              <ServiceCard
                num={card.num}
                title={card.title}
                body={card.body}
                tags={[...card.tags]}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
