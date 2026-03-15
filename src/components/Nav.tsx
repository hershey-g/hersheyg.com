"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { label: "what I build", href: "#services" },
  { label: "proof of work", href: "#proof" },
  { label: "about", href: "#about" },
  { label: "let's talk", href: "#contact" },
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ids = ["hero", "services", "proof", "about", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { threshold: 0, rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => { if (mq.matches) setMenuOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMobileLink = useCallback((href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

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
              {link.href === "#contact" ? (
                <button
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                  className="border border-line rounded-sm px-3.5 py-1.5 font-mono text-sm text-text hover:text-white hover:border-accent-lit transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  href={link.href}
                  className={`text-sm transition-colors ${
                    activeSection === link.href.slice(1) ? "text-text" : "text-dim hover:text-text"
                  }`}
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className={`block w-5 h-[1.5px] bg-white transition-transform duration-200 ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-white transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-white transition-transform duration-200 ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-line bg-bg/95 backdrop-blur-md"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleMobileLink(link.href)}
                    className="w-full text-left py-2.5 text-sm text-dim hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}

            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
