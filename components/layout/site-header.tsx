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
    <header className="sticky top-0 z-30 h-[var(--header-height)] border-b border-border bg-background/95 backdrop-blur">
      <Container className="relative flex h-full items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-display text-lg tracking-[0.02em] text-foreground"
          >
            ZETRAXUS
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            aria-label="Search — coming soon"
            title="Search — coming soon"
            className="hidden h-9 w-9 items-center justify-center border border-border-strong text-faint md:flex disabled:cursor-not-allowed"
          >
            <SearchIcon />
          </button>

          <div className="hidden md:block">
            <CreateMenu />
          </div>

          <Link
            href="/profile"
            className="hidden h-9 w-9 items-center justify-center border border-border-strong text-sm text-muted transition-colors hover:text-foreground md:flex"
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
