"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import ProofCard from "./ProofCard";

function TestimonialRotator() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % COPY.testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [paused]);

  const testimonial = COPY.testimonials[activeIndex];

  return (
    <div
      className="mt-12 sm:mt-16 max-w-2xl mx-auto text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Large quote mark */}
      <span className="text-4xl text-accent-lit/20 font-serif leading-none block mb-4" aria-hidden="true">"</span>

      {/* Rotating quote */}
      <div className="min-h-[120px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={activeIndex}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-base sm:text-lg text-body leading-relaxed italic">
              {testimonial.text}
            </p>
            <cite className="block mt-4 font-mono text-xs text-dim not-italic">
              {testimonial.attribution}
            </cite>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-6">
        {COPY.testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i === activeIndex ? "bg-accent-lit" : "bg-accent/20"
            }`}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Proof() {
  return (
    <section id="proof" className="py-14 sm:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <SectionTag>{COPY.proof.tag}</SectionTag>
          <div className="mt-4">
            <SectionHead bold={COPY.proof.heading[0]} dim={COPY.proof.heading[1]} />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {COPY.proof.cards.map((card, i) => (
            <RevealOnScroll key={i} delay={i * 0.12}>
              <ProofCard card={card} />
            </RevealOnScroll>
          ))}
        </div>

        {/* Testimonial rotator */}
        <RevealOnScroll>
          <TestimonialRotator />
        </RevealOnScroll>

        {/* Section CTA */}
        <RevealOnScroll>
          <div className="mt-12 sm:mt-16 text-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-intake-modal"))}
              className="inline-flex items-center font-mono text-sm text-accent-lit hover:text-white transition-colors group"
            >
              Want results like these? Let&apos;s talk
              <span className="ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
