"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { useT } from "@/lib/i18n/provider";

export default function VerifyEmailPage() {
  const t = useT();

  return (
    <AuthShell title={t("auth.verifyTitle")} width={500}>
      <div className="text-center">
        <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full border border-white/20" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/[0.04]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
        </span>

        <p className="mt-7 text-sm leading-6 text-white/45">{t("auth.verifyText")}</p>

        <div className="mt-8 rounded-xl border border-white/[0.1] bg-white/[0.02] p-4">
          <p className="text-[12px] text-white/30">{t("auth.verifyHint")}</p>
        </div>

        <Link
          href="/auth/login"
          className="mt-8 inline-flex h-11 items-center rounded-full border border-white/25 px-7 text-[10px] font-semibold uppercase tracking-[3px] text-white/50 transition-colors hover:border-white/50 hover:text-white"
        >
          ← {t("auth.backToLogin")}
        </Link>
      </div>
    </AuthShell>
  );
}
