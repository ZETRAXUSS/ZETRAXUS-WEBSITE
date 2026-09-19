"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient light behind the hero frame. Drifts a few pixels on scroll for a
 * sense of depth — deliberately subtle, and inert entirely when the visitor
 * prefers reduced motion.
 */
export function ParallaxField() {
  const nearRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (nearRef.current) {
          nearRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
        }
        if (farRef.current) {
          farRef.current.style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={farRef}
        className="absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[110px] will-change-transform"
      />
      <div
        ref={nearRef}
        className="absolute top-24 left-1/2 h-[220px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.08] blur-[80px] will-change-transform"
      />
    </div>
  );
}
