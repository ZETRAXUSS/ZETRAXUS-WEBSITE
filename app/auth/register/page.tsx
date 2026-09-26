"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthShell } from "@/components/auth/auth-shell";
import { useT } from "@/lib/i18n/provider";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RegisterView />
    </Suspense>
  );
}

function RegisterView() {
  const t = useT();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/profile";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/profile";
  const [accepted, setAccepted] = useState(false);

  return (
    <AuthShell
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      width={440}
      footer={
        <p className="text-center text-[12px] text-white/40">
          {t("auth.haveAccount")}{" "}
          <Link href="/auth/login" className="text-white transition-colors hover:text-white/80">
            {t("auth.signIn")}
          </Link>
        </p>
      }
    >
      <GoogleButton
        next={next}
        disabled={!accepted}
        note={!accepted ? <p className="mt-2 text-center text-[10px] text-white/25">{t("auth.acceptForGoogle")}</p> : null}
      />
      <RegisterForm accepted={accepted} onAcceptedChange={setAccepted} />
    </AuthShell>
  );
}
