"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { AuthDivider, GoogleButton } from "@/components/auth/google-button";
import { AuthShell } from "@/components/auth/auth-shell";
import { useT } from "@/lib/i18n/provider";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginView />
    </Suspense>
  );
}

function LoginView() {
  const t = useT();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/profile";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/profile";
  const error = params.get("error");

  return (
    <AuthShell
      title={t("auth.signInTitle")}
      subtitle={t("auth.signInSubtitle")}
      footer={
        <p className="text-center text-[12px] text-white/40">
          {t("auth.noAccount")}{" "}
          <Link href={`/auth/register${next !== "/profile" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-white transition-colors hover:text-white/80">
            {t("auth.createOne")}
          </Link>
        </p>
      }
    >
      {error && (
        <p className="zx-rise-in mb-5 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-300">
          {t("auth.callbackError")}
        </p>
      )}
      <GoogleButton next={next} />
      <AuthDivider />
      <LoginForm next={next} />
    </AuthShell>
  );
}
