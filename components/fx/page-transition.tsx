"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Branded page transition.
 *
 * On an internal link click the navigation is held back for a moment while two
 * curtains close over the page with the ZETRAXUS mark in the middle. The new
 * route then mounts *behind* the curtains (that is where the heavy work — star
 * fields, data, images — happens), and only once it has painted and settled do
 * the curtains open again. The user never sees a half-built page, so there is
 * no visible stutter. Total ≈ 1.1–1.5 s.
 *
 * Same-page links (query/hash only), new tabs, downloads and external links
 * are left alone. `data-no-transition` on a link opts out.
 */

type Phase = "idle" | "covering" | "holding" | "revealing";

const COVER_MS = 420; // curtains close
const MIN_HOLD_MS = 520; // logo stays at least this long
const REVEAL_MS = 620; // curtains open
const SAFETY_MS = 8000; // never block the site if a route hangs

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const coveredAt = useRef(0);
  const targetPath = useRef<string | null>(null);
  const timers = useRef<number[]>([]);
  const reduced = useRef(false);

  const set = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const reveal = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "revealing") return;
    const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - coveredAt.current));
    later(() => {
      // Let the new page paint twice before opening the curtains.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          set("revealing");
          document.documentElement.classList.remove("zx-transitioning");
          later(() => {
            set("idle");
            targetPath.current = null;
          }, reduced.current ? 200 : REVEAL_MS);
        }),
      );
    }, wait);
  }, []);

  // Intercept internal link clicks (capture phase, before next/link).
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (document.documentElement.classList.contains("zx-intro-lock")) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.hasAttribute("data-no-transition")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // filters, tabs, #anchors
      if (phaseRef.current !== "idle") {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      const href = `${url.pathname}${url.search}${url.hash}`;
      targetPath.current = url.pathname;
      router.prefetch(href);

      clearTimers();
      set("covering");
      document.documentElement.classList.add("zx-transitioning");

      later(() => {
        coveredAt.current = performance.now();
        set("holding");
        router.push(href);
      }, reduced.current ? 120 : COVER_MS);

      // Fail-safe
      later(() => {
        if (phaseRef.current !== "idle") {
          set("revealing");
          document.documentElement.classList.remove("zx-transitioning");
          later(() => set("idle"), REVEAL_MS);
        }
      }, SAFETY_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // The new route has rendered → open the curtains.
  useEffect(() => {
    if (phaseRef.current === "holding") {
      reveal();
    }
  }, [pathname, reveal]);

  const active = phase !== "idle";

  return (
    <div
      aria-hidden="true"
      className={`zx-pt ${active ? "zx-pt--active" : ""} zx-pt--${phase}`}
    >
      <div className="zx-pt__curtain zx-pt__curtain--top" />
      <div className="zx-pt__curtain zx-pt__curtain--bottom" />
      <div className="zx-pt__center">
        <span className="zx-pt__ring" />
        <span className="zx-pt__ring zx-pt__ring--late" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/zetraxus-mark.png" alt="" className="zx-pt__mark" decoding="async" />
        <span className="zx-pt__word">ZETRAXUS</span>
        <span className="zx-pt__bar">
          <span />
        </span>
      </div>
    </div>
  );
}
