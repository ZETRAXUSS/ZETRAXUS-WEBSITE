import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CreateMenu } from "@/components/layout/create-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { primaryNav } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="relative z-40 px-4 pt-5 md:px-6 md:pt-6">
      <Container className="mx-auto flex h-[70px] w-full max-w-[1760px] items-center justify-between rounded-[22px] border border-white/[0.12] bg-[#080808]/90 px-5 shadow-[0_15px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-white"
          aria-label="ZETRAXUS Home"
        >
          <img
            src="/zetraxus-mark.png"
            alt=""
            className="h-7 w-7 object-contain opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
          />

          <span className="text-[15px] font-bold tracking-[3px] transition-opacity duration-300 group-hover:opacity-75">
            ZETRAXUS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-2 text-[11px] font-medium uppercase tracking-[2px] text-white/40 transition-colors duration-300 hover:text-white"
            >
              <span>{item.label}</span>

              <span className="absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 group-hover:w-full" />
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
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.025] text-white/40 transition-all duration-300 hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-70 md:flex"
          >
            <SearchIcon />
          </button>

          <div className="hidden md:block">
            <CreateMenu />
          </div>

          <Link
            href="/profile"
            aria-label="Profile"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.025] text-[11px] font-semibold text-white/60 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] md:flex"
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
