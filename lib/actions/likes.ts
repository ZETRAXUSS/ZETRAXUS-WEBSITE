"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Like a thread.
 */
export async function likeThread(
  threadId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.from("thread_likes").insert({
      thread_id: threadId,
      user_id: user.id,
    } as never);

    if (error) {
      if (error.code === "23505") {
        // Already liked
        return { success: false, error: "Already liked" };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to like thread",
    };
  }
}

/**
 * Unlike a thread.
 */
export async function unlikeThread(
  threadId: string
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
      .from("thread_likes")
      .delete()
      .eq("thread_id", threadId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unlike thread",
    };
  }
}

/**
 * Get thread like count.
 */
export async function getThreadLikeCount(threadId: string): Promise<number> {
  const supabase = await createClient();

  try {
    const { count } = await supabase
      .from("thread_likes")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", threadId);

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Check if current user has liked a thread.
 */
export async function hasLikedThread(threadId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("thread_likes")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", threadId)
      .eq("user_id", user.id)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Like a reply.
 */
export async function likeReply(
  replyId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.from("reply_likes").insert({
      reply_id: replyId,
      user_id: user.id,
    } as never);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Already liked" };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to like reply",
    };
  }
}

/**
 * Unlike a reply.
 */
export async function unlikeReply(
  replyId: string
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
      .from("reply_likes")
      .delete()
      .eq("reply_id", replyId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unlike reply",
    };
  }
}

/**
 * Get reply like count.
 */
export async function getReplyLikeCount(replyId: string): Promise<number> {
  const supabase = await createClient();

  try {
    const { count } = await supabase
      .from("reply_likes")
      .select("*", { count: "exact", head: true })
      .eq("reply_id", replyId);

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Check if current user has liked a reply.
 */
export async function hasLikedReply(replyId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("reply_likes")
      .select("*", { count: "exact", head: true })
      .eq("reply_id", replyId)
      .eq("user_id", user.id)
      .single();

    return !!data;
  } catch {
    return false;
  }
}
