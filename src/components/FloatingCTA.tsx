"use client";

import { useEffect, useState } from "react";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const contact = document.getElementById("contact");
    if (!hero || !contact) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const heroEntry = entries.find((e) => e.target === hero);
        const contactEntry = entries.find((e) => e.target === contact);

        if (heroEntry) {
          setVisible((prev) => (heroEntry.isIntersecting ? false : prev));
        }
        if (contactEntry) {
          setVisible((prev) => (contactEntry.isIntersecting ? false : prev));
        }

        // Show when hero is out and contact is out
        const heroRect = hero.getBoundingClientRect();
        const contactRect = contact.getBoundingClientRect();
        const heroOut = heroRect.bottom < 0;
        const contactOut = contactRect.top > window.innerHeight;
        setVisible(heroOut && contactOut);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    observer.observe(contact);

    return () => observer.disconnect();
  }, []);

  return (
    <a
      href="#contact"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 md:hidden font-mono text-sm text-white bg-accent border border-accent-lit/30 rounded-full px-6 py-3 shadow-lg transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      let&apos;s talk
    </a>
  );
}
