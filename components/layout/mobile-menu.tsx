"use client";

import { useState } from "react";
import Link from "next/link";
import { primaryNav } from "@/lib/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { logoutUser } from "@/lib/actions/auth";

/**
 * Collapsed navigation for small viewports. Mirrors primaryNav plus auth items.
 */
export function MobileMenu() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  async function handleLogout() {
    setIsLogoutLoading(true);
    await logoutUser();
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] border border-white/[0.12] rounded-full bg-white/[0.025] text-white/40 transition-all duration-300 hover:border-white/30 hover:text-white"
      >
        <span
          className={`h-px w-4 bg-current transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
        />
        <span className={`h-px w-4 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`h-px w-4 bg-current transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute right-4 top-20 z-50 w-56 rounded-[20px] border border-white/[0.1] bg-[#080808] shadow-[0_15px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <nav className="flex flex-col p-4">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-[11px] font-medium uppercase tracking-[1px] text-white/60 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-white/[0.08] my-2" />

            {user && profile ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-[11px] font-medium uppercase tracking-[1px] text-white/60 transition-colors hover:text-white"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  disabled={isLogoutLoading}
                  className="px-4 py-3 text-[11px] font-medium uppercase tracking-[1px] text-white/60 transition-colors hover:text-white disabled:opacity-50 text-left"
                >
                  {isLogoutLoading ? "..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-[11px] font-medium uppercase tracking-[1px] text-white/60 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-[11px] font-medium uppercase tracking-[1px] text-white transition-colors hover:text-white/80"
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
