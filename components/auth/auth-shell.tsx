"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { StarField } from "@/components/home/star-field";
import { SplitText } from "@/components/fx/split-text";
import { useT } from "@/lib/i18n/provider";

/** Shared frame for sign in / register / verify pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  width = 420,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const t = useT();
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <section className="relative px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <StarField />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-40 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[120px]" />

        <div className="relative z-10 mx-auto w-full" style={{ maxWidth: width }}>
          <div className="mb-10 text-center">
            <Link href="/" className="group relative mx-auto mb-7 flex h-14 w-14 items-center justify-center">
              <span className="absolute h-14 w-14 rounded-full bg-white/[0.05] blur-xl transition-all duration-700 group-hover:bg-white/15" />
              <img
                src="/zetraxus-mark.png"
                alt=""
                className="relative h-12 w-12 object-contain opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.45)] transition-all duration-700 group-hover:rotate-[20deg] group-hover:scale-110 group-hover:opacity-100"
              />
            </Link>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">
              <SplitText text={title} delay={80} stagger={30} />
            </h1>
            {subtitle && <p className="zx-rise-in mt-3 text-sm text-white/40" style={{ animationDelay: "250ms" }}>{subtitle}</p>}
          </div>

          <div
            data-spotlight
            className="zx-panel-in relative overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#080808]/90 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            style={{ animationDelay: "120ms" }}
          >
            <div className="relative z-[3]">{children}</div>
            {footer && <div className="relative z-[3] mt-8 border-t border-white/[0.08] pt-6">{footer}</div>}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-[11px] font-medium uppercase tracking-[2px] text-white/35 transition-colors hover:text-white/70"
            >
              ← {t("auth.backHome")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
