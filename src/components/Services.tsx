"use client";

import { useRef, useState, useEffect } from "react";
import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import ServiceCard from "./ServiceCard";

export default function Services() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardCount = COPY.services.cards.length;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const cards = container.querySelectorAll("[data-index]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <SectionTag>{COPY.services.tag}</SectionTag>
          <div className="mt-4">
            <SectionHead bold={COPY.services.heading[0]} dim={COPY.services.heading[1]} />
          </div>
        </RevealOnScroll>

        {/* Desktop grid */}
        <div className="mt-12 hidden lg:grid grid-cols-3 bg-line gap-px rounded-md overflow-hidden">
          {COPY.services.cards.map((card, index) => (
            <RevealOnScroll key={card.num} delay={index * 0.12}>
              <ServiceCard
                num={card.num}
                title={card.title}
                body={card.body}
                tags={[...card.tags]}
              />
            </RevealOnScroll>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="mt-12 lg:hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {COPY.services.cards.map((card, index) => (
              <div
                key={card.num}
                data-index={index}
                className="min-w-[85vw] flex-shrink-0 snap-center"
              >
                <ServiceCard
                  num={card.num}
                  title={card.title}
                  body={card.body}
                  tags={[...card.tags]}
                />
              </div>
            ))}
          </div>

          {/* Indicator dots */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: cardCount }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i === activeIndex ? "bg-accent-lit" : "bg-line"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
