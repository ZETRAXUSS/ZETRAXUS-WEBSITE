"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n/provider";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
      </span>
      <h1 className="mt-8 text-3xl font-black tracking-[-0.03em] text-white">{t("error.pageTitle")}</h1>
      <p className="mt-3 text-sm text-white/40">{t("error.pageText")}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 h-11 rounded-full border border-white/25 px-7 text-[10px] font-semibold uppercase tracking-[2px] text-white/70 transition-all hover:border-white hover:bg-white hover:text-black"
      >
        {t("error.retry")}
      </button>
    </div>
  );
}
