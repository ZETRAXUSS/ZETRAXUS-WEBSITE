import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CreateMenu } from "@/components/layout/create-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { primaryNav } from "@/lib/navigation";

/**
 * Global site header. Renders from primaryNav so adding a new
 * top-level section (Worlds, Lore, etc.) later is a one-line change
 * in lib/navigation.ts, not a template edit.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-[var(--header-height)] border-b border-white/10 bg-background/70 backdrop-blur-xl bg-gradient-to-b from-white/5 to-transparent">
      <Container className="relative flex h-full items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-wider text-foreground transition-all duration-300 hover:text-white group flex items-center gap-2"
        >
          <span className="relative">
            ZETRAXUS
            <span className="absolute inset-0 blur-md opacity-0 bg-gradient-to-r from-white/20 to-transparent group-hover:opacity-100 transition-opacity duration-300" />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-all duration-300 hover:text-foreground relative group capitalize tracking-wide"
            >
              <span className="relative z-10">{item.label}</span>
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-white to-white/30 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            disabled
            aria-label="Search — coming soon"
            title="Search — coming soon"
            className="hidden md:flex h-8 w-8 items-center justify-center border border-white/10 text-faint hover:text-foreground hover:border-white/20 rounded-[var(--radius-sm)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed glow-border"
          >
            <SearchIcon />
          </button>

          <div className="hidden md:block">
            <CreateMenu />
          </div>

          <Link
            href="/profile"
            className="hidden md:flex h-8 w-8 items-center justify-center border border-white/10 text-sm text-muted hover:text-foreground hover:border-white/20 rounded-[var(--radius-sm)] transition-all duration-300 glow-border glow-text"
            aria-label="Profile"
          >
            <span aria-hidden>Z</span>
          </Link>

          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
