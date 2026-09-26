"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Browser-side auth calls. Running these in the browser (instead of server
 * actions) lets the shared <AuthProvider> hear SIGNED_IN / SIGNED_OUT
 * instantly, so the header, forum and profile update without a reload.
 */

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return { error: error?.message ?? null, code: error?.code ?? null };
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { display_name: displayName.trim() },
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    },
  });
  return {
    error: error?.message ?? null,
    needsConfirmation: !data.session,
  };
}

export async function signInWithGoogle(next = "/profile") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  return { error: error?.message ?? null };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
