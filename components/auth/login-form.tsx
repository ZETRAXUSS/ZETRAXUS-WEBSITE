"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/auth/client-auth";
import { useT } from "@/lib/i18n/provider";
import { playSound } from "@/lib/sound/engine";

const inputClass =
  "w-full h-12 rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/35 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.03)]";

export function LoginForm({ next = "/profile" }: { next?: string }) {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signInWithEmail(email, password);

    if (result.error) {
      setError(
        result.code === "email_not_confirmed"
          ? t("auth.emailNotConfirmed")
          : result.code === "invalid_credentials"
            ? t("auth.invalidCredentials")
            : result.error,
      );
      setLoading(false);
      playSound("error");
      return;
    }

    playSound("success");
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className={inputClass}
        />
      </div>

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
        <span className="relative">{loading ? t("auth.signingIn") : t("auth.signIn")}</span>
      </button>
    </form>
  );
}
