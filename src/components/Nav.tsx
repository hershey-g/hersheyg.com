"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "what I build", href: "#services" },
  { label: "proof of work", href: "#proof" },
  { label: "let's talk", href: "#contact" },
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileCTA = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-intake-modal"));
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-bg/80 backdrop-blur-md border-b border-line"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Wordmark */}
        <a href="#" className="flex items-center text-sm sm:text-base">
          <span className="flex items-center">
            <span className="font-bold uppercase tracking-[0.14em] text-white">
              HERSHEY
            </span>
            <span className="font-light text-dim mx-1.5">/</span>
            <span className="font-light uppercase tracking-[0.1em] text-text">
              GOLDBERGER
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={
                  link.href === "#contact"
                    ? "border border-line rounded-sm px-3.5 py-1.5 font-mono text-sm text-text hover:text-white hover:border-accent-lit transition-colors"
                    : "text-dim hover:text-text transition-colors text-sm"
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile pill CTA — replaces hamburger menu */}
        <button
          onClick={handleMobileCTA}
          className="md:hidden font-mono text-xs text-white bg-accent border border-accent-lit/30 rounded-full px-4 py-2 hover:bg-accent-lit transition-colors"
        >
          let&apos;s talk
        </button>
      </div>
    </motion.nav>
  );
}
