"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Create" menu button with dropdown actions.
 */
export function CreateMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="h-9 px-4 rounded-full border border-white/[0.12] bg-white/[0.025] text-[10px] font-semibold uppercase tracking-[1px] text-white/60 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
      >
        Create
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-[16px] border border-white/[0.1] bg-[#0a0a0a] shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden"
        >
          {/* Discussion */}
          <a
            href="#create-thread"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            role="menuitem"
            className="flex items-start justify-between gap-3 px-4 py-3 border-b border-white/[0.08] hover:bg-white/[0.05] transition-colors"
          >
            <div>
              <p className="text-[11px] font-semibold text-white">Discussion</p>
              <p className="text-[9px] text-white/40 mt-0.5">Start a forum thread</p>
            </div>
            <span className="shrink-0 text-white/30">→</span>
          </a>

          {/* Project (Coming Soon) */}
          <div
            role="menuitem"
            aria-disabled="true"
            className="flex cursor-not-allowed items-start justify-between gap-3 px-4 py-3 border-b border-white/[0.08] opacity-50"
          >
            <div>
              <p className="text-[11px] font-semibold text-white/60">Project</p>
              <p className="text-[9px] text-white/30 mt-0.5">Showcase your work</p>
            </div>
            <span className="shrink-0 text-[8px] uppercase tracking-[1px] text-white/20">Soon</span>
          </div>

          {/* World (Coming Soon) */}
          <div
            role="menuitem"
            aria-disabled="true"
            className="flex cursor-not-allowed items-start justify-between gap-3 px-4 py-3 opacity-50"
          >
            <div>
              <p className="text-[11px] font-semibold text-white/60">World</p>
              <p className="text-[9px] text-white/30 mt-0.5">Build your universe</p>
            </div>
            <span className="shrink-0 text-[8px] uppercase tracking-[1px] text-white/20">Soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
