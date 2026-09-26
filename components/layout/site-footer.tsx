"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { useT } from "@/lib/i18n/provider";
import { useSearchPalette } from "@/components/search/search-palette";

export function SiteFooter() {
  const t = useT();
  const palette = useSearchPalette();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("footer.platform"),
      links: [
        { href: "/explore", label: t("nav.explore") },
        { href: "/projects", label: t("nav.projects") },
        { href: "/forum", label: t("nav.forum") },
        { href: "/shop", label: t("nav.shop") },
      ],
    },
    {
      title: t("footer.community"),
      links: [
        { href: "/profile", label: t("nav.profile") },
        { href: "/forum?view=saved", label: t("nav.saved") },
        { href: "/forum?new=1", label: t("create.discussion") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/terms", label: t("legal.terms.title") },
        { href: "/privacy", label: t("legal.privacy.title") },
      ],
    },
  ];

  return (
    <footer className="relative mt-32 border-t border-white/[0.08] bg-background/50 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <Container className="flex flex-col gap-12 py-16 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-4">
          <Link href="/" className="group inline-flex items-center gap-3">
            <img
              src="/zetraxus-mark.png"
              alt=""
              className="h-6 w-6 object-contain opacity-70 transition-all duration-700 group-hover:rotate-[20deg] group-hover:opacity-100"
            />
            <span className="text-sm font-bold tracking-[3px] text-foreground">ZETRAXUS</span>
          </Link>
          <p className="text-xs leading-relaxed text-faint">{t("footer.tagline")}</p>
          <button
            type="button"
            onClick={() => palette.open()}
            data-sound="off"
            className="group flex items-center gap-2 text-[11px] text-white/30 hover:text-white"
          >
            <kbd className="rounded border border-white/[0.12] px-1.5 py-0.5 font-mono text-[9px] group-hover:border-white/40">
              Ctrl K
            </kbd>
            {t("footer.searchHint")}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[2.5px] text-foreground/70">{column.title}</p>
              <ul className="space-y-2.5 text-xs text-faint">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
                    >
                      <span className="h-px w-0 bg-white transition-all duration-300 group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Container className="flex flex-col gap-3 border-t border-white/[0.05] py-6 text-[10px] uppercase tracking-[2px] text-white/20 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} ZETRAXUS</p>
        <p>{t("footer.rights")}</p>
      </Container>
    </footer>
  );
}
