"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser, Profile } from "@/types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isStaff: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  isStaff: false,
  isAdmin: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: session.user.user_metadata,
          });
          await loadProfile(session.user.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get session");
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "INITIAL_SESSION") return;

      if (session?.user) {
        setUser((prev) =>
          prev?.id === session.user.id
            ? prev
            : {
                id: session.user.id,
                email: session.user.email || "",
                user_metadata: session.user.user_metadata,
              },
        );
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          // Defer so we never call Supabase inside the auth callback itself.
          setTimeout(() => {
            if (active) loadProfile(session.user.id);
          }, 0);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      error,
      isStaff: profile?.role === "admin" || profile?.role === "moderator",
      isAdmin: profile?.role === "admin",
      refreshProfile,
    }),
    [user, profile, loading, error, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
