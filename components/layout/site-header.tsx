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
    <header className="sticky top-0 z-30 h-[var(--header-height)] border-b border-border bg-background/80 backdrop-blur-lg backdrop-saturate-150">
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-r from-white/0 via-white/[0.01] to-white/0" />
      
      <Container className="relative flex h-full items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-display text-lg tracking-[0.04em] text-foreground font-semibold transition-colors hover:text-accent"
          >
            ZETRAXUS
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-all duration-300 hover:text-foreground relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-accent to-transparent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled
            aria-label="Search — coming soon"
            title="Search — coming soon"
            className="hidden h-9 w-9 items-center justify-center border border-border-strong text-faint hover:text-foreground hover:border-border-strong/70 md:flex disabled:cursor-not-allowed transition-colors duration-300"
          >
            <SearchIcon />
          </button>

          <div className="hidden md:block">
            <CreateMenu />
          </div>

          <Link
            href="/profile"
            className="hidden h-9 w-9 items-center justify-center border border-border-strong text-sm text-muted transition-all duration-300 hover:text-foreground hover:border-accent/30 md:flex glow-link"
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
