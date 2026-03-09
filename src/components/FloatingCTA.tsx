"use client";

import { useEffect, useState } from "react";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const contact = document.getElementById("contact");
    if (!hero || !contact) return;

    const visibilityMap = new Map<Element, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibilityMap.set(entry.target, entry.isIntersecting);
        }
        const heroVisible = visibilityMap.get(hero) ?? true;
        const contactVisible = visibilityMap.get(contact) ?? true;
        setVisible(!heroVisible && !contactVisible);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    observer.observe(contact);

    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-intake-modal"));
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 md:hidden font-mono text-sm text-white bg-accent border border-accent-lit/30 rounded-full px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-[opacity,transform] duration-300 active:scale-95 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      let&apos;s talk
    </button>
  );
}
