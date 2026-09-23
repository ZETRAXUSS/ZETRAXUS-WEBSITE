"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/auth";

/**
 * Get a profile by ID.
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    return data || null;
  } catch {
    return null;
  }
}

/**
 * Get a profile by username.
 */
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient();

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    return data || null;
  } catch {
    return null;
  }
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  updates: Partial<Profile>
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data as Profile };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

/**
 * Get follower count for a user.
 */
export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = await createClient();

  try {
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get following count for a user.
 */
export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = await createClient();

  try {
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Check if current user follows another user.
 */
export async function isFollowing(userId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}
