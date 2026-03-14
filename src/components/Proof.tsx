"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion, useInView } from "framer-motion";
import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import Parallax from "./Parallax";

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

function CountUpMetric({ value }: { value: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const parsed = useMemo(() => {
    const match = value.match(/^([\d,]+)(.*)$/);
    if (!match) return null;
    return { num: parseInt(match[1].replace(/,/g, ""), 10), suffix: match[2] };
  }, [value]);

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!parsed || !isInView || prefersReducedMotion) {
      setDisplay(value);
      return;
    }
    const duration = 1800;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const current = Math.round(eased * parsed.num);
      setDisplay(current.toLocaleString() + parsed.suffix);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, parsed, prefersReducedMotion, value]);

  return (
    <p
      ref={ref}
      className="font-extrabold text-white leading-[1.1] tracking-[-0.03em] mb-3"
      style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
    >
      {display}
    </p>
  );
}

export default function Proof() {
  return (
    <section id="proof" className="py-[120px] bg-bg">
      <div className="max-w-[900px] mx-auto px-6 sm:px-12">
        <Parallax speed={0.95}>
          <RevealOnScroll>
            <SectionTag>{COPY.proof.tag}</SectionTag>
            <div className="mt-4">
              <SectionHead bold={COPY.proof.heading[0]} dim={COPY.proof.heading[1]} />
            </div>
          </RevealOnScroll>
        </Parallax>

        {/* Proof rows */}
        <div className="mt-12">
          {COPY.proof.cards.map((card, i) => (
            <RevealOnScroll key={i} delay={i * 0.12}>
              <div
                className={`grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-12 py-9 border-t border-line${
                  i === COPY.proof.cards.length - 1 ? " border-b" : ""
                }`}
              >
                {/* Left column: label */}
                <div className="mb-4 sm:mb-0 pt-[4px]">
                  <span className="font-mono text-[12px] text-dim uppercase tracking-widest">
                    {card.label}
                  </span>
                </div>

                {/* Right column: metric, body, badge */}
                <div>
                  <CountUpMetric value={card.metric} />
                  <p className="text-base text-body leading-[1.65] max-w-[560px]">
                    {card.body}
                  </p>
                  <div className="inline-flex items-center gap-2 mt-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-term-green" aria-hidden="true" />
                    <span className="font-mono text-[12px] text-dim">{card.badge}</span>
                  </div>
                </div>
              </div>
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
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
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
