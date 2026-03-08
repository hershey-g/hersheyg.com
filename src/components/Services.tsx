"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import ServiceCard from "./ServiceCard";

export default function Services() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [hasNudged, setHasNudged] = useState(false);
  const cardCount = COPY.services.cards.length;
  const prefersReducedMotion = useReducedMotion();

  // Track which card is in view via IntersectionObserver
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

  // Track scroll position to hide right fade when at end
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 20);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check initial state
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // One-time nudge animation when section enters viewport
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView || hasNudged || prefersReducedMotion) return;
    const container = scrollRef.current;
    if (!container) return;

    const timeout = setTimeout(() => {
      container.style.transition = "transform 0.3s ease-out";
      container.style.transform = "translateX(-40px)";
      setTimeout(() => {
        container.style.transition = "transform 0.3s ease-in";
        container.style.transform = "translateX(0)";
        setTimeout(() => {
          container.style.transition = "";
          container.style.transform = "";
          setHasNudged(true);
        }, 300);
      }, 300);
    }, 400);

    return () => clearTimeout(timeout);
  }, [isInView, hasNudged, prefersReducedMotion]);

  return (
    <section id="services" className="py-16 sm:py-32" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <SectionTag>{COPY.services.tag}</SectionTag>
          <div className="mt-4">
            <SectionHead bold={COPY.services.heading[0]} dim={COPY.services.heading[1]} />
          </div>
        </RevealOnScroll>

        {/* Desktop grid */}
        <div className="mt-12 hidden lg:grid grid-cols-3 gap-6">
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

        {/* Mobile horizontal scroll */}
        <div className="mt-8 lg:mt-12 lg:hidden">
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-6 px-6"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            >
              {COPY.services.cards.map((card, index) => (
                <div
                  key={card.num}
                  data-index={index}
                  className="min-w-[78vw] flex-shrink-0 snap-center"
                >
                  <ServiceCard
                    num={card.num}
                    title={card.title}
                    body={card.body}
                    tags={[...card.tags]}
                  />
                </div>
              ))}
              {/* End spacer so last card can snap-center */}
              <div className="min-w-[4px] flex-shrink-0" aria-hidden="true" />
            </div>

            {/* Right fade overlay */}
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-4 w-10 z-10 transition-opacity duration-200"
              style={{
                background: "linear-gradient(to right, transparent, var(--color-bg))",
                opacity: atEnd ? 0 : 1,
              }}
              aria-hidden="true"
            />
          </div>

          {/* Counter indicator: 01 / 03 — Title */}
          <div className="flex items-center mt-3 font-mono text-xs">
            <span className="text-dim">
              {String(activeIndex + 1).padStart(2, "0")} / {String(cardCount).padStart(2, "0")}
            </span>
            <span className="text-dim mx-2">&mdash;</span>
            <span className="text-text truncate">
              {COPY.services.cards[activeIndex].title}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
