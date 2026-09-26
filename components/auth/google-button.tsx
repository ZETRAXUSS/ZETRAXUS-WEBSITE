"use client";

import { useEffect, useState, type ReactNode } from "react";
import { signInWithGoogle } from "@/lib/auth/client-auth";
import { useT } from "@/lib/i18n/provider";
import { GoogleIcon } from "@/components/ui/icons";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eicbvvrayoubpbkuttmi.supabase.co").trim();
const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpY2J2dnJheW91YnBia3V0dG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODQyMjcsImV4cCI6MjEwNTY2MDIyN30.OzmAEBVYoHmkfuerbfIqmvxhZ6khtZaaOxWWmcjyXQ4"
).trim();

let cachedEnabled: boolean | null = null;

/**
 * Asks Supabase whether the Google provider is switched on. The button only
 * appears when it is — so visitors never land on Supabase's raw
 * "provider is not enabled" error page.
 */
function useGoogleEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(cachedEnabled);

  useEffect(() => {
    if (cachedEnabled !== null) return;
    let active = true;
    fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings: { external?: { google?: boolean } } | null) => {
        cachedEnabled = settings?.external?.google === true;
        if (active) setEnabled(cachedEnabled);
      })
      .catch(() => {
        if (active) setEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return enabled;
}

/** Google sign-in button + "or" divider. Renders nothing while Google is disabled. */
export function GoogleButton({ next = "/profile", disabled, note }: { next?: string; disabled?: boolean; note?: ReactNode }) {
  const t = useT();
  const enabled = useGoogleEnabled();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  return (
    <div className="zx-rise-in">
      <button
        type="button"
        disabled={loading || disabled}
        onClick={async () => {
          setLoading(true);
          setError(null);
          const result = await signInWithGoogle(next);
          if (result.error) {
            setError(t("auth.googleError"));
            setLoading(false);
          }
        }}
        className="group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/[0.14] bg-white/[0.03] text-[12px] font-semibold tracking-[0.5px] text-white/85 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] disabled:opacity-50"
      >
        <span className="pointer-events-none absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-white/[0.06] transition-all duration-700 group-hover:left-[150%]" />
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white" />
        ) : (
          <span className="rounded-full bg-white p-1">
            <GoogleIcon size={14} />
          </span>
        )}
        {t("auth.continueWithGoogle")}
      </button>
      {error && <p className="mt-2 text-center text-[11px] text-red-300">{error}</p>}
      {note}
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[9px] uppercase tracking-[3px] text-white/25">{t("auth.or")}</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
    </div>
  );
}
