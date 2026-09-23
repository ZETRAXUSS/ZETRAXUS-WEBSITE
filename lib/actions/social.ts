"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Follow a user.
 */
export async function followUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    if (user.id === userId) {
      return { success: false, error: "Cannot follow yourself" };
    }

    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: userId,
    } as never);

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation - already following
        return { success: false, error: "Already following this user" };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Follow failed",
    };
  }
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unfollow failed",
    };
  }
}
