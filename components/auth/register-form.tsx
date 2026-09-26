"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/auth/client-auth";
import { useT } from "@/lib/i18n/provider";
import { playSound } from "@/lib/sound/engine";
import { CheckIcon } from "@/components/ui/icons";

const inputClass =
  "w-full h-12 rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/35 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.03)]";

export function RegisterForm({ accepted, onAcceptedChange }: { accepted: boolean; onAcceptedChange: (value: boolean) => void }) {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = Math.min(
    4,
    (password.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(password) ? 1 : 0) +
      (/[0-9]/.test(password) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(password) ? 1 : 0),
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!accepted) {
      setError(t("auth.mustAccept"));
      playSound("error");
      return;
    }
    if (password.length < 8) {
      setError(t("auth.passwordTooShort"));
      playSound("error");
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(email, password, displayName);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      playSound("error");
      return;
    }

    playSound("success");
    if (result.needsConfirmation) {
      router.push("/auth/verify-email");
    } else {
      router.push("/profile");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="displayName" className="mb-2 block text-[11px] font-medium uppercase tracking-[2px] text-white/60">
          {t("profile.displayName")}
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          maxLength={40}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t("auth.displayNamePlaceholder")}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-[11px] font-medium uppercase tracking-[2px] text-white/60">
          {t("auth.email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-[11px] font-medium uppercase tracking-[2px] text-white/60">
          {t("auth.password")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordPlaceholder")}
          required
          className={inputClass}
        />
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
                password && i < Math.max(1, strength) ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "bg-white/[0.08]"
              }`}
            />
          ))}
        </div>
      </div>

      <label className="group flex cursor-pointer items-start gap-3 text-[12px] leading-5 text-white/45">
        <button
          type="button"
          role="checkbox"
          aria-checked={accepted}
          onClick={() => onAcceptedChange(!accepted)}
          data-sound="toggle"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-300 ${
            accepted ? "border-white bg-white text-black shadow-[0_0_14px_rgba(255,255,255,0.35)]" : "border-white/25 group-hover:border-white/50"
          }`}
        >
          {accepted && <CheckIcon size={12} className="zx-pop" />}
        </button>
        <span>
          {t("auth.acceptPrefix")}{" "}
          <Link href="/terms" target="_blank" className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">
            {t("legal.terms.title")}
          </Link>{" "}
          {t("auth.and")}{" "}
          <Link href="/privacy" target="_blank" className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">
            {t("legal.privacy.title")}
          </Link>
          {t("auth.acceptSuffix")}
        </span>
      </label>

      {error && (
        <div className="zx-rise-in rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        data-sound="off"
        className="group relative h-12 w-full overflow-hidden rounded-xl border border-white/25 bg-white text-[12px] font-semibold uppercase tracking-[2px] text-black transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="pointer-events-none absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-black/10 transition-all duration-700 group-hover:left-[150%]" />
        <span className="relative">{loading ? t("auth.creatingAccount") : t("auth.createAccount")}</span>
      </button>
    </form>
  );
}
