import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CreateMenu } from "@/components/layout/create-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { primaryNav } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="relative z-40 px-5 pt-5 md:px-6 md:pt-6">
      <Container className="relative flex h-[68px] items-center justify-between rounded-[20px] border border-white/[0.12] bg-[#080808]/90 px-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-7">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white"
        >
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute h-3 w-3 rotate-45 border border-white/70 transition-all duration-500 group-hover:scale-125 group-hover:border-white" />
            <span className="absolute h-1.5 w-1.5 rotate-45 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          </span>

          <span className="text-[15px] font-bold tracking-[3px] transition-opacity duration-300 group-hover:opacity-80">
            ZETRAXUS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-2 text-[12px] font-medium uppercase tracking-[2px] text-white/45 transition-colors duration-300 hover:text-white"
            >
              {item.label}

              <span className="absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled
            aria-label="Search — coming soon"
            title="Search — coming soon"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.025] text-white/45 transition-all duration-300 hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-70 md:flex"
          >
            <SearchIcon />
          </button>

          <div className="hidden md:block">
            <CreateMenu />
          </div>

          <Link
            href="/profile"
            aria-label="Profile"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.025] text-[11px] font-semibold text-white/65 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_18px_rgba(255,255,255,0.08)] md:flex"
          >
            Z
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
      <circle
        cx="6.5"
        cy="6.5"
        r="4.7"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path
        d="M10.2 10.2L14 14"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}
