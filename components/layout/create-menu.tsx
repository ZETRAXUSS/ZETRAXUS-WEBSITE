"use client";

import { useEffect, useRef, useState } from "react";
import { createActions } from "@/lib/navigation";

/**
 * "Create" entry point. Every action inside is disabled — the systems
 * behind them (projects, worlds, lore, forum, shop) don't exist yet —
 * but the menu itself is real, so the information architecture doesn't
 * need to change when those systems ship.
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
        className="rounded-[var(--radius-sm)] border border-border-strong px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        Create
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-72 border border-border bg-surface p-1 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        >
          {createActions.map((action) => (
            <div
              key={action.label}
              role="menuitem"
              aria-disabled="true"
              className="flex cursor-not-allowed items-start justify-between gap-3 px-3 py-2.5"
            >
              <div>
                <p className="text-sm text-foreground/70">{action.label}</p>
                <p className="text-xs text-faint">{action.description}</p>
              </div>
              <span className="mt-0.5 shrink-0 text-[11px] text-faint">Soon</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
