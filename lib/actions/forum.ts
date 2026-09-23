"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ForumThread = Database["public"]["Tables"]["forum_threads"]["Row"];
type ForumReply = Database["public"]["Tables"]["forum_replies"]["Row"];

/**
 * Get all forum categories.
 */
export async function getForumCategories() {
  const supabase = await createClient();

  try {
    const { data } = await supabase
      .from("forum_categories")
      .select("*")
      .order("created_at", { ascending: true });

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Get a single category by slug.
 */
export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();

  try {
    const { data } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("slug", slug)
      .single();

    return data;
  } catch {
    return null;
  }
}

/**
 * Get threads for a category.
 */
export async function getThreadsByCategory(
  categoryId: string,
  limit = 20,
  offset = 0
) {
  const supabase = await createClient();

  try {
    const { data } = await supabase
      .from("forum_threads")
      .select(
        `
        *,
        profiles:author_id(id, username, display_name, avatar_url),
        forum_categories(id, name, slug)
      `
      )
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Get a single thread with replies.
 */
export async function getThreadWithReplies(threadId: string) {
  const supabase = await createClient();

  try {
    const { data: thread } = await supabase
      .from("forum_threads")
      .select(
        `
        *,
        profiles:author_id(id, username, display_name, avatar_url),
        forum_categories(id, name, slug),
        thread_likes(count)
      `
      )
      .eq("id", threadId)
      .single();

    if (!thread) return { thread: null, replies: [] };

    const { data: replies } = await supabase
      .from("forum_replies")
      .select(
        `
        *,
        profiles:author_id(id, username, display_name, avatar_url),
        reply_likes(count)
      `
      )
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    return { thread, replies: replies || [] };
  } catch {
    return { thread: null, replies: [] };
  }
}

/**
 * Create a new forum thread.
 */
export async function createThread(
  categoryId: string,
  title: string,
  body: string
): Promise<{ success: boolean; error?: string; thread?: ForumThread }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("forum_threads")
      .insert({
        author_id: user.id,
        category_id: categoryId,
        title,
        body,
      } as never)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, thread: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create thread",
    };
  }
}

/**
 * Update a forum thread (only author can).
 */
export async function updateThread(
  threadId: string,
  title: string,
  body: string
): Promise<{ success: boolean; error?: string; thread?: ForumThread }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("forum_threads")
      .update({
        title,
        body,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", threadId)
      .eq("author_id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, thread: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update thread",
    };
  }
}

/**
 * Delete a forum thread (only author can).
 */
export async function deleteThread(
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
      .from("forum_threads")
      .delete()
      .eq("id", threadId)
      .eq("author_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete thread",
    };
  }
}

/**
 * Create a reply to a thread.
 */
export async function createReply(
  threadId: string,
  body: string
): Promise<{ success: boolean; error?: string; reply?: ForumReply }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("forum_replies")
      .insert({
        thread_id: threadId,
        author_id: user.id,
        body,
      } as never)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, reply: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create reply",
    };
  }
}

/**
 * Update a reply (only author can).
 */
export async function updateReply(
  replyId: string,
  body: string
): Promise<{ success: boolean; error?: string; reply?: ForumReply }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("forum_replies")
      .update({
        body,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", replyId)
      .eq("author_id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, reply: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update reply",
    };
  }
}

/**
 * Delete a reply (only author can).
 */
export async function deleteReply(
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
      .from("forum_replies")
      .delete()
      .eq("id", replyId)
      .eq("author_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete reply",
    };
  }
}
