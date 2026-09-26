"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { primaryNav } from "@/lib/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { signOut } from "@/lib/auth/client-auth";
import { useT } from "@/lib/i18n/provider";
import { SoundToggle } from "@/components/layout/sound-toggle";
import { LangToggle } from "@/components/layout/lang-toggle";
import { Avatar } from "@/components/ui/avatar";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Full-screen menu for small viewports: staggered links, auth items,
 * sound + language switches.
 */
export function MobileMenu() {
  const { user, profile, isStaff } = useAuth();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const links = [
    ...primaryNav.map((item) => ({ href: item.href, label: t(item.labelKey) })),
    ...(user
      ? [
          { href: "/profile", label: t("nav.profile") },
          { href: "/forum?view=saved", label: t("nav.saved") },
          ...(isStaff ? [{ href: "/admin", label: t("nav.admin") }] : []),
        ]
      : []),
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
        data-sound={open ? "close" : "open"}
        className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-white/[0.12] bg-white/[0.025] text-white/60 transition-all duration-300 hover:border-white/30 hover:text-white"
      >
        <span className={`h-px w-4 bg-current transition-transform duration-500 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
        <span className={`h-px w-4 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`h-px w-4 bg-current transition-transform duration-500 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
      </button>

      {open && mounted && createPortal(
        <div id="mobile-nav" className="fixed inset-0 z-[90] md:hidden">
          <div className="zx-backdrop-in absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={() => setOpen(false)} />

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("header.closeMenu")}
            data-sound="close"
            className="zx-rise-in absolute right-7 top-9 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.15] text-white/70 hover:border-white/40 hover:text-white"
          >
            <CloseIcon size={16} />
          </button>

          <div className="zx-panel-in relative flex h-full flex-col px-7 pb-10 pt-28">
            {user && profile && (
              <div className="zx-rise-in mb-8 flex items-center gap-3">
                <Avatar name={profile.display_name} src={profile.avatar_url} size={42} ring />
                <div>
                  <p className="text-sm font-semibold text-white">{profile.display_name}</p>
                  <p className="text-[11px] text-white/40">@{profile.username}</p>
                </div>
              </div>
            )}

            <nav className="flex flex-col">
              {links.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="zx-rise-in group flex items-center justify-between border-b border-white/[0.06] py-4 text-2xl font-semibold tracking-[-0.02em] text-white/70 transition-colors hover:text-white"
                  style={{ animationDelay: `${80 + index * 50}ms` }}
                >
                  {item.label}
                  <span className="text-sm text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60">
                    →
                  </span>
                </Link>
              ))}
            </nav>

            <div className="zx-rise-in mt-8 flex items-center gap-3" style={{ animationDelay: "380ms" }}>
              <SoundToggle />
              <LangToggle />
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-12 rounded-full border border-white/[0.15] text-[11px] font-semibold uppercase tracking-[2px] text-white/60 hover:border-white/40 hover:text-white"
                >
                  {t("auth.signOut")}
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center justify-center rounded-full bg-white text-[11px] font-semibold uppercase tracking-[2px] text-black"
                  >
                    {t("auth.createAccount")}
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center justify-center rounded-full border border-white/[0.15] text-[11px] font-semibold uppercase tracking-[2px] text-white/70"
                  >
                    {t("auth.signIn")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
