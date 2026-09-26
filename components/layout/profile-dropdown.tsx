"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client-auth";
import { useAuth } from "@/lib/auth/use-auth";
import { useT } from "@/lib/i18n/provider";
import { Avatar } from "@/components/ui/avatar";
import { BookmarkIcon, LogoutIcon, ShieldIcon, UserIcon } from "@/components/ui/icons";
import type { Profile } from "@/types/auth";

interface ProfileDropdownProps {
  profile: Profile;
}

export function ProfileDropdown({ profile }: ProfileDropdownProps) {
  const router = useRouter();
  const t = useT();
  const { isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    setIsLogoutLoading(true);
    await signOut();
    setOpen(false);
    setIsLogoutLoading(false);
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const itemClass =
    "group/item flex items-center gap-3 px-4 py-2.5 text-[11px] font-medium text-white/65 transition-all duration-300 hover:bg-white/[0.05] hover:pl-5 hover:text-white";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t("nav.profile")}
        data-sound={open ? "close" : "open"}
        className={`flex h-9 w-9 items-center justify-center rounded-full border p-[2px] transition-all duration-300 ${
          open
            ? "border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.18)]"
            : "border-white/[0.15] hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        }`}
      >
        <Avatar name={profile.display_name} src={profile.avatar_url} size={30} />
      </button>

      {open && (
        <div className="zx-drop-in absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#0a0a0a]/95 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-4">
            <Avatar name={profile.display_name} src={profile.avatar_url} size={38} ring />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-white">{profile.display_name}</p>
              <p className="mt-0.5 truncate text-[10px] text-white/40">@{profile.username}</p>
            </div>
          </div>

          <nav className="flex flex-col py-1.5">
            <Link href="/profile" onClick={() => setOpen(false)} className={itemClass}>
              <UserIcon size={14} className="text-white/40 group-hover/item:text-white" />
              {t("nav.viewProfile")}
            </Link>
            <Link href="/forum?view=saved" onClick={() => setOpen(false)} className={itemClass}>
              <BookmarkIcon size={14} className="text-white/40 group-hover/item:text-white" />
              {t("nav.saved")}
            </Link>
            {isStaff && (
              <Link href="/admin" onClick={() => setOpen(false)} className={itemClass}>
                <ShieldIcon size={14} className="text-white/40 group-hover/item:text-white" />
                {t("nav.admin")}
              </Link>
            )}

            <div className="my-1.5 h-px bg-white/[0.08]" />

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className={`${itemClass} w-full text-left disabled:opacity-50`}
            >
              <LogoutIcon size={14} className="text-white/40 group-hover/item:text-white" />
              {isLogoutLoading ? t("auth.signingOut") : t("auth.signOut")}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
