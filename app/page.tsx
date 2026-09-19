import Link from "next/link";
import { GlowMark } from "@/components/home/glow-mark";
import { StarField } from "@/components/home/star-field";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-5 py-5">
      <div
        className="relative flex min-h-[560px] w-full max-w-[1200px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/[0.12] px-6 py-16"
        style={{
          background: "radial-gradient(circle at center, #0d0d0d 0%, #000000 100%)",
        }}
      >
        <StarField />

        <div className="relative flex flex-col items-center gap-8">
          <GlowMark size={64} />

          <div className="flex flex-col items-center gap-4">
            <h1
              className="text-[36px] font-black leading-none tracking-[6px] text-white md:text-[60px] md:tracking-[12px]"
              style={{
                textShadow:
                  "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)",
              }}
            >
              ZETRAXUS
            </h1>
            <p className="text-[12px] tracking-[6px] text-white/50 md:text-[13px]">
              ENTER THE NETWORK
            </p>
          </div>

          <Link
            href="/explore"
            className="flex h-[48px] w-[160px] items-center justify-center rounded-[24px] border border-white/40 bg-white/[0.03] text-[13px] font-semibold tracking-[3px] text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300 hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          >
            ENTER
          </Link>
        </div>
      </div>
    </div>
  );
}
