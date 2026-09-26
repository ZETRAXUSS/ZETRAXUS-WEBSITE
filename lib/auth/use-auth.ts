"use client";

import { useContext } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";

/**
 * Current user + profile. Backed by a single <AuthProvider> in the root
 * layout, so every component shares one session listener and one profile
 * query instead of each opening its own.
 */
export function useAuth() {
  return useContext(AuthContext);
}
