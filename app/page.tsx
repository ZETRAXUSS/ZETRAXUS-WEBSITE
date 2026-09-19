import Link from "next/link";
import { GlowMark } from "@/components/home/glow-mark";
import { StarField } from "@/components/home/star-field";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-1px)] w-full flex-col items-center px-5 py-5">
      <section
        className="relative flex min-h-[calc(100vh-40px)] w-full max-w-[1200px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/[0.12] bg-black px-6 py-20"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #111111 0%, #070707 35%, #000000 78%)",
        }}
      >
        {/* Ambient center light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[100px]"
        />

        {/* Subtle outer glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[38%] h-[180px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[90px]"
        />

        <StarField />

        {/* Very subtle frame details */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-6 top-6 h-8 w-8 border-l border-t border-white/[0.12]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-6 h-8 w-8 border-r border-t border-white/[0.12]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-6 h-8 w-8 border-b border-l border-white/[0.12]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-6 h-8 w-8 border-b border-r border-white/[0.12]"
        />

        {/* Hero */}
        <div className="relative z-10 flex w-full max-w-[760px] flex-col items-center text-center">
          {/* Emblem */}
          <div className="mb-8 transition-transform duration-700 hover:scale-105">
            <GlowMark size={64} />
          </div>

          {/* Brand */}
          <h1
            className="whitespace-nowrap text-[42px] font-black leading-none tracking-[8px] text-white sm:text-[52px] md:text-[64px] md:tracking-[12px]"
            style={{
              textShadow:
                "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)",
            }}
          >
            ZETRAXUS
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-[11px] font-medium uppercase tracking-[6px] text-white/45 sm:text-[13px]">
            ENTER THE NETWORK
          </p>

          {/* CTA */}
          <Link
            href="/explore"
            className="group mt-10 flex h-[48px] w-[160px] items-center justify-center rounded-full border border-white/40 bg-white/[0.03] text-[13px] font-semibold tracking-[3px] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300 hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          >
            <span className="transition-transform duration-300 group-hover:translate-x-[2px]">
              ENTER
            </span>
          </Link>
        </div>

        {/* Bottom information */}
        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap text-[9px] uppercase tracking-[4px] text-white/20">
          <span className="h-px w-8 bg-white/15" />
          <span>CREATIVE PLATFORM</span>
          <span className="h-px w-8 bg-white/15" />
        </div>
      </section>
    </main>
  );
}
