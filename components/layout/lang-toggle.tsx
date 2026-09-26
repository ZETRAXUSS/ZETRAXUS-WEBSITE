"use client";

import { useI18n } from "@/lib/i18n/provider";

/** Compact EN / TR switch with a sliding highlight. */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("header.language")}
      className={`relative flex h-9 shrink-0 items-center rounded-full border border-white/[0.12] bg-white/[0.025] p-[3px] ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-[3px] h-[28px] w-[34px] rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(${lang === "en" ? 0 : 34}px)` }}
      />
      {(["en", "tr"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => lang !== code && setLang(code)}
          aria-pressed={lang === code}
          data-sound="toggle"
          className={`relative z-10 h-[28px] w-[34px] rounded-full text-[10px] font-semibold uppercase tracking-[1.5px] transition-colors duration-300 ${
            lang === code ? "text-black" : "text-white/40 hover:text-white"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
