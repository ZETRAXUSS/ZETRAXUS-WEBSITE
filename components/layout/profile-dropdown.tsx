"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutUser } from "@/lib/actions/auth";
import type { Profile } from "@/types/auth";

interface ProfileDropdownProps {
  profile: Profile;
}

export function ProfileDropdown({ profile }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    setIsLogoutLoading(true);
    await logoutUser();
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="h-9 w-9 flex items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.025] text-[11px] font-semibold text-white/60 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
      >
        {profile.display_name.charAt(0).toUpperCase()}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-[16px] border border-white/[0.1] bg-[#0a0a0a] shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header with user info */}
          <div className="border-b border-white/[0.08] px-4 py-3">
            <p className="text-[11px] font-semibold text-white truncate">{profile.display_name}</p>
            <p className="text-[9px] text-white/40 mt-0.5 truncate">@{profile.username}</p>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col py-1">
            {/* View Profile */}
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-[11px] font-medium text-white/70 transition-colors hover:text-white hover:bg-white/[0.05] flex items-center gap-2"
            >
              <span>👤</span>
              <span>View Profile</span>
            </Link>

            {/* Settings */}
            <button
              type="button"
              disabled
              className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-white/40 flex items-center gap-2 opacity-60 cursor-not-allowed"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            {/* Divider */}
            <div className="h-px bg-white/[0.08] my-1" />

            {/* Logout */}
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              disabled={isLogoutLoading}
              className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-white/70 transition-colors hover:text-white hover:bg-white/[0.05] flex items-center gap-2 disabled:opacity-50"
            >
              <span>🚪</span>
              <span>{isLogoutLoading ? "Signing out..." : "Sign out"}</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
