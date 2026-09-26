"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin glowing progress line at the very top of the viewport while a new
 * route loads. Starts on internal link clicks, completes when the pathname
 * (or query) actually changes.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "finishing">("idle");
  const [progress, setProgress] = useState(0);
  const tickRef = useRef<number | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setState("loading");
      setProgress(12);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Trickle while loading.
  useEffect(() => {
    if (state !== "loading") return;
    tickRef.current = window.setInterval(() => {
      setProgress((value) => (value < 88 ? value + (90 - value) * 0.08 : value));
    }, 160);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [state]);

  // Route changed → complete.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setProgress(100);
    setState("finishing");
    const timer = window.setTimeout(() => {
      setState("idle");
      setProgress(0);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      style={{ opacity: state === "idle" ? 0 : 1, transition: "opacity 400ms ease" }}
    >
      <div
        className="h-full bg-gradient-to-r from-white/0 via-white to-white shadow-[0_0_12px_rgba(255,255,255,0.9),0_0_28px_rgba(255,255,255,0.35)]"
        style={{
          width: `${progress}%`,
          transition: "width 380ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
