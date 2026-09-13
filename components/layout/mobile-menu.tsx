"use client";

import { useState } from "react";
import Link from "next/link";
import { primaryNav } from "@/lib/navigation";

/**
 * Collapsed navigation for small viewports. Mirrors primaryNav plus the
 * secondary items (Search, Profile) that live inline on desktop.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] border border-border-strong"
      >
        <span
          className={`h-px w-4 bg-foreground transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
        />
        <span className={`h-px w-4 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`h-px w-4 bg-foreground transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-[var(--header-height)] z-20 border-b border-border bg-surface"
        >
          <nav className="flex flex-col px-6 py-4">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-sm text-foreground/85 last:border-b-0"
              >
                {item.label}
              </Link>
            ))}
            <span
              aria-disabled="true"
              className="border-b border-border py-3 text-sm text-faint"
            >
              Search — coming soon
            </span>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="pt-3 text-sm text-foreground/85"
            >
              Profile
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
