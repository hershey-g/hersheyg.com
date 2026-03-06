"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const NAV_LINKS = [
  { label: "build", href: "#services" },
  { label: "proof", href: "#proof" },
  { label: "contact", href: "#contact" },
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // Close menu if viewport crosses md breakpoint (e.g. device rotation)
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute("href");
      setMenuOpen(false);
      // Wait for body scroll lock to release before scrolling
      requestAnimationFrame(() => {
        if (href) {
          const target = document.querySelector(href);
          target?.scrollIntoView({ behavior: "smooth" });
        }
      });
    },
    [],
  );

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          menuOpen
            ? "bg-bg border-b border-transparent"
            : scrolled
              ? "bg-bg/80 backdrop-blur-md border-b border-line"
              : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Wordmark */}
          <a href="#" className="flex items-center text-xs sm:text-sm">
            <span className="flex items-center">
              <span className="font-bold uppercase tracking-[0.14em] text-white">
                HERSHEY
              </span>
              <span className="font-light text-dim mx-1 sm:mx-1.5">/</span>
              <span className="font-light uppercase tracking-[0.1em] text-text">
                GOLDBERGER
              </span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-dim hover:text-text transition-colors text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={closeMenu}
                className="border border-line rounded-sm px-3.5 py-1.5 font-mono text-sm text-text hover:text-white hover:border-accent-lit transition-colors"
              >
                Say hello
              </a>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex md:hidden font-mono text-sm text-dim"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "close" : "menu"}
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay — outside nav to avoid backdrop-filter containing block */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -20 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -20 }
            }
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg md:hidden"
          >
            <ul className="flex flex-col items-center gap-10">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={handleNavClick}
                    className="text-text text-4xl font-medium transition-colors hover:text-accent-lit"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={handleNavClick}
              className="mt-14 border border-line rounded-sm px-5 py-2.5 font-mono text-lg text-text hover:text-white hover:border-accent-lit transition-colors"
            >
              Say hello
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
