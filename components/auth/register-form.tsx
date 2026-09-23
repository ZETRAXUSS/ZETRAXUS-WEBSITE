"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await registerUser(email, password, displayName);

    if (!result.success) {
      setError(result.error || "Registration failed");
      setLoading(false);
      return;
    }

    onSuccess?.();
    router.push("/auth/verify-email");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="displayName" className="block text-[11px] font-medium uppercase tracking-[2px] text-white/60 mb-2">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Creator Name"
          required
          className="w-full h-11 rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-[11px] font-medium uppercase tracking-[2px] text-white/60 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full h-11 rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[11px] font-medium uppercase tracking-[2px] text-white/60 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          required
          className="w-full h-11 rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-lg border border-white/25 bg-white text-black font-semibold text-[12px] tracking-[2px] uppercase transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
