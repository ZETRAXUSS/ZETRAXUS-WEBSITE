"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CreateMenu } from "@/components/layout/create-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SoundToggle } from "@/components/layout/sound-toggle";
import { LangToggle } from "@/components/layout/lang-toggle";
import { useSearchPalette } from "@/components/search/search-palette";
import { SearchIcon } from "@/components/ui/icons";
import { primaryNav } from "@/lib/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { useT } from "@/lib/i18n/provider";

export function SiteHeader() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const t = useT();
  const palette = useSearchPalette();

  return (
    <header className="relative z-40 px-4 pt-5 md:px-6 md:pt-6">
      <Container className="mx-auto flex h-[70px] w-full max-w-[1760px] items-center justify-between rounded-[22px] border border-white/[0.12] bg-[#080808]/90 px-5 shadow-[0_15px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl md:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 text-white" aria-label="ZETRAXUS">
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-white/0 blur-md transition-all duration-700 group-hover:bg-white/25" />
            <img
              src="/zetraxus-mark.png"
              alt=""
              className="relative h-7 w-7 object-contain opacity-90 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[20deg] group-hover:scale-110 group-hover:opacity-100"
            />
          </span>

          <span className="text-[15px] font-bold tracking-[3px] transition-all duration-500 group-hover:tracking-[4px] group-hover:opacity-80">
            ZETRAXUS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex lg:gap-8">
          {primaryNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative py-2 text-[11px] font-medium uppercase tracking-[2px] transition-colors duration-300 ${
                  active ? "text-white" : "text-white/40 hover:text-white"
                }`}
              >
                <span>{t(item.labelKey)}</span>

                <span
                  className={`absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
                {active && (
                  <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => palette.open()}
            aria-label={t("search.title")}
            title={`${t("search.title")} (Ctrl K)`}
            data-sound="off"
            className="group flex h-9 items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.025] pl-[10px] pr-[10px] text-white/40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/30 hover:bg-white/[0.05] hover:text-white xl:pr-2"
          >
            <SearchIcon size={15} className="transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-110" />
            <span className="hidden text-[11px] tracking-[0.5px] text-white/30 transition-colors group-hover:text-white/60 xl:block">
              {t("search.short")}
            </span>
            <kbd className="hidden rounded-full border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-white/30 xl:block">
              Ctrl K
            </kbd>
          </button>

          <SoundToggle className="hidden lg:flex" />
          <LangToggle className="hidden lg:flex" />

          {user && <NotificationBell />}

          {user && (
            <div className="hidden md:block">
              <CreateMenu />
            </div>
          )}

          {user && profile ? (
            <div className="hidden items-center gap-3 md:flex">
              <ProfileDropdown profile={profile} />
            </div>
          ) : !loading && !user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/auth/login"
                className="flex h-9 items-center rounded-full border border-white/[0.12] bg-white/[0.025] px-4 text-[10px] font-semibold uppercase tracking-[1px] text-white/60 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
              >
                {t("auth.signIn")}
              </Link>
              <Link
                href="/auth/register"
                data-magnetic="0.2"
                className="flex h-9 items-center rounded-full border border-white/25 bg-white px-4 text-[10px] font-semibold uppercase tracking-[1px] text-black transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {t("auth.register")}
              </Link>
            </div>
          ) : (
            <span className="zx-skeleton hidden h-9 w-9 rounded-full md:block" />
          )}

          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
