"use client";

import { createClient, db } from "@/lib/supabase/client";
import type { TranslationKey } from "@/lib/i18n/translate";
import type {
  ForumCategory,
  ForumStats,
  MediaItem,
  ReplyItem,
  ReportReason,
  ReportTarget,
  ThreadDetail,
  ThreadSort,
  ThreadSummary,
} from "./types";

const AUTHOR = "author:profiles!forum_threads_author_id_fkey(id, username, display_name, avatar_url, role)";
const REPLY_AUTHOR = "author:profiles!forum_replies_author_id_fkey(id, username, display_name, avatar_url, role)";
const CATEGORY = "category:forum_categories(id, name, name_tr, slug)";
const MEDIA = "media:media_uploads(id, url, width, height, status, owner_id)";

export const PAGE_SIZE = 15;

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

const ERROR_KEYS: [string, TranslationKey][] = [
  ["RATE_LIMIT_THREADS_DAILY", "error.rateThreadsDaily"],
  ["RATE_LIMIT_THREADS", "error.rateThreads"],
  ["RATE_LIMIT_REPLIES_HOURLY", "error.rateRepliesHourly"],
  ["RATE_LIMIT_REPLIES", "error.rateReplies"],
  ["RATE_LIMIT_REPORTS", "error.rateReports"],
  ["RATE_LIMIT_UPLOADS", "error.rateUploads"],
  ["DUPLICATE_CONTENT", "error.duplicate"],
  ["forum_threads_title_len", "error.titleLength"],
  ["forum_threads_body_len", "error.bodyLength"],
  ["forum_replies_body_len", "error.bodyLength"],
  ["row-level security", "error.forbidden"],
  ["BANNED", "error.banned"],
  ["REJECTED", "error.imageRejected"],
  ["TOO_LARGE", "error.imageTooLarge"],
  ["BAD_TYPE", "error.imageType"],
  ["UNAUTHORIZED", "error.signInRequired"],
  ["duplicate key", "error.alreadyDone"],
];

export function errorKey(message: string | null | undefined): TranslationKey {
  if (!message) return "error.generic";
  const match = ERROR_KEYS.find(([needle]) => message.includes(needle));
  return match ? match[1] : "error.generic";
}

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: TranslationKey };

function fail<T>(message?: string | null): Result<T> {
  return { ok: false, error: errorKey(message) };
}

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */

export async function fetchCategories(): Promise<ForumCategory[]> {
  const supabase = db();
  const { data } = await supabase
    .from("forum_categories")
    .select("id, name, slug, description, name_tr, description_tr, sort_order")
    .order("sort_order", { ascending: true });
  return (data as ForumCategory[] | null) ?? [];
}

export async function fetchForumStats(): Promise<ForumStats | null> {
  const supabase = db();
  const { data } = await supabase.rpc("forum_stats");
  return (data as ForumStats | null) ?? null;
}

function sanitizeQuery(value: string) {
  return value.replace(/[,()%*\\:"'.]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export interface ThreadQuery {
  sort: ThreadSort;
  categoryId?: string | null;
  authorUsername?: string | null;
  query?: string | null;
  savedBy?: string | null;
  page: number;
}

export async function fetchThreads(options: ThreadQuery): Promise<{ items: ThreadSummary[]; hasMore: boolean }> {
  const supabase = db();

  let authorId: string | null = null;
  if (options.authorUsername) {
    const { data: author } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", options.authorUsername)
      .maybeSingle();
    if (!author) return { items: [], hasMore: false };
    authorId = (author as { id: string }).id;
  }

  let savedIds: string[] | null = null;
  if (options.savedBy) {
    const { data: saved } = await supabase
      .from("thread_bookmarks")
      .select("thread_id")
      .eq("user_id", options.savedBy)
      .order("created_at", { ascending: false })
      .limit(500);
    savedIds = ((saved as { thread_id: string }[] | null) ?? []).map((row) => row.thread_id);
    if (!savedIds.length) return { items: [], hasMore: false };
  }

  let request = supabase
    .from("forum_threads")
    .select(
      `id, title, body, created_at, last_activity_at, edited_at, reply_count, like_count, view_count, is_pinned, is_locked, ${CATEGORY}, ${AUTHOR}, media:media_uploads(count)`,
    );

  if (options.categoryId) request = request.eq("category_id", options.categoryId);
  if (authorId) request = request.eq("author_id", authorId);
  if (savedIds) request = request.in("id", savedIds);

  const q = sanitizeQuery(options.query ?? "");
  if (q.length >= 2) {
    request = request.or(`title.ilike."%${q}%",body.ilike."%${q}%"`);
  }

  if (options.sort === "unanswered") request = request.eq("reply_count", 0);

  const ordered =
    options.sort === "new" || options.sort === "unanswered"
      ? request.order("created_at", { ascending: false })
      : options.sort === "active"
        ? request.order("reply_count", { ascending: false }).order("last_activity_at", { ascending: false })
        : options.sort === "top"
          ? request.order("like_count", { ascending: false }).order("created_at", { ascending: false })
          : request.order("is_pinned", { ascending: false }).order("last_activity_at", { ascending: false });

  const from = options.page * PAGE_SIZE;
  const { data } = await ordered.range(from, from + PAGE_SIZE);
  const rows = (data as unknown as ThreadSummary[] | null) ?? [];

  return { items: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE };
}

export async function fetchThread(id: string): Promise<ThreadDetail | null> {
  const supabase = db();
  const { data } = await supabase
    .from("forum_threads")
    .select(
      `id, title, body, author_id, category_id, created_at, last_activity_at, edited_at, reply_count, like_count, view_count, is_pinned, is_locked, ${CATEGORY}, ${AUTHOR}, ${MEDIA}`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const thread = data as unknown as ThreadDetail;
  // Only attachments that belong to the thread itself (not to its replies).
  thread.media = (thread.media ?? []).filter((item) => item.status !== "rejected");
  return thread;
}

export async function fetchReplies(threadId: string): Promise<ReplyItem[]> {
  const supabase = db();
  const { data } = await supabase
    .from("forum_replies")
    .select(`id, thread_id, author_id, body, created_at, edited_at, like_count, ${REPLY_AUTHOR}, ${MEDIA}`)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(500);
  return ((data as unknown as ReplyItem[] | null) ?? []).map((reply) => ({
    ...reply,
    media: (reply.media ?? []).filter((item) => item.status !== "rejected"),
  }));
}

export async function fetchReply(replyId: string): Promise<ReplyItem | null> {
  const supabase = db();
  const { data } = await supabase
    .from("forum_replies")
    .select(`id, thread_id, author_id, body, created_at, edited_at, like_count, ${REPLY_AUTHOR}, ${MEDIA}`)
    .eq("id", replyId)
    .maybeSingle();
  return (data as unknown as ReplyItem | null) ?? null;
}

export async function fetchViewerState(threadId: string, userId: string) {
  const supabase = db();
  const [threadLike, bookmark, replyLikes] = await Promise.all([
    supabase.from("thread_likes").select("thread_id").eq("thread_id", threadId).eq("user_id", userId).maybeSingle(),
    supabase.from("thread_bookmarks").select("thread_id").eq("thread_id", threadId).eq("user_id", userId).maybeSingle(),
    supabase
      .from("reply_likes")
      .select("reply_id, forum_replies!inner(thread_id)")
      .eq("user_id", userId)
      .eq("forum_replies.thread_id", threadId),
  ]);

  return {
    liked: !!threadLike.data,
    bookmarked: !!bookmark.data,
    likedReplies: new Set(((replyLikes.data as { reply_id: string }[] | null) ?? []).map((row) => row.reply_id)),
  };
}

export async function fetchBookmarkedIds(userId: string, threadIds: string[]): Promise<Set<string>> {
  if (!threadIds.length) return new Set();
  const supabase = db();
  const { data } = await supabase
    .from("thread_bookmarks")
    .select("thread_id")
    .eq("user_id", userId)
    .in("thread_id", threadIds);
  return new Set(((data as { thread_id: string }[] | null) ?? []).map((row) => row.thread_id));
}

export async function incrementView(threadId: string) {
  const key = `zx-viewed-${threadId}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
  const supabase = db();
  await supabase.rpc("increment_thread_view", { p_thread: threadId });
}

/* ------------------------------------------------------------------ */
/* Write                                                               */
/* ------------------------------------------------------------------ */

async function attachMedia(mediaIds: string[], target: { thread_id?: string; reply_id?: string }) {
  if (!mediaIds.length) return;
  const supabase = db();
  await supabase.from("media_uploads").update(target).in("id", mediaIds);
}

export async function createThread(input: {
  userId: string;
  categoryId: string;
  title: string;
  body: string;
  mediaIds: string[];
}): Promise<Result<{ id: string }>> {
  const supabase = db();
  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      author_id: input.userId,
      category_id: input.categoryId,
      title: input.title.trim(),
      body: input.body.trim(),
    })
    .select("id")
    .single();

  if (error || !data) return fail(error?.message);
  const id = (data as { id: string }).id;
  await attachMedia(input.mediaIds, { thread_id: id });
  return { ok: true, data: { id } };
}

export async function updateThread(
  id: string,
  patch: { title?: string; body?: string; category_id?: string; is_pinned?: boolean; is_locked?: boolean },
): Promise<Result> {
  const supabase = db();
  const { error } = await supabase.from("forum_threads").update(patch).eq("id", id);
  return error ? fail(error.message) : { ok: true, data: undefined };
}

export async function deleteThread(id: string): Promise<Result> {
  const supabase = db();
  const { error } = await supabase.from("forum_threads").delete().eq("id", id);
  return error ? fail(error.message) : { ok: true, data: undefined };
}

export async function createReply(input: {
  userId: string;
  threadId: string;
  body: string;
  mediaIds: string[];
}): Promise<Result<{ id: string }>> {
  const supabase = db();
  const { data, error } = await supabase
    .from("forum_replies")
    .insert({ author_id: input.userId, thread_id: input.threadId, body: input.body.trim() })
    .select("id")
    .single();

  if (error || !data) return fail(error?.message);
  const id = (data as { id: string }).id;
  await attachMedia(input.mediaIds, { reply_id: id });
  return { ok: true, data: { id } };
}

export async function updateReply(id: string, body: string): Promise<Result> {
  const supabase = db();
  const { error } = await supabase.from("forum_replies").update({ body: body.trim() }).eq("id", id);
  return error ? fail(error.message) : { ok: true, data: undefined };
}

export async function deleteReply(id: string): Promise<Result> {
  const supabase = db();
  const { error } = await supabase.from("forum_replies").delete().eq("id", id);
  return error ? fail(error.message) : { ok: true, data: undefined };
}

export async function setThreadLike(threadId: string, userId: string, liked: boolean): Promise<Result> {
  const supabase = db();
  const { error } = liked
    ? await supabase.from("thread_likes").insert({ thread_id: threadId, user_id: userId })
    : await supabase.from("thread_likes").delete().eq("thread_id", threadId).eq("user_id", userId);
  return error && !error.message.includes("duplicate key") ? fail(error.message) : { ok: true, data: undefined };
}

export async function setReplyLike(replyId: string, userId: string, liked: boolean): Promise<Result> {
  const supabase = db();
  const { error } = liked
    ? await supabase.from("reply_likes").insert({ reply_id: replyId, user_id: userId })
    : await supabase.from("reply_likes").delete().eq("reply_id", replyId).eq("user_id", userId);
  return error && !error.message.includes("duplicate key") ? fail(error.message) : { ok: true, data: undefined };
}

export async function setBookmark(threadId: string, userId: string, saved: boolean): Promise<Result> {
  const supabase = db();
  const { error } = saved
    ? await supabase.from("thread_bookmarks").insert({ thread_id: threadId, user_id: userId })
    : await supabase.from("thread_bookmarks").delete().eq("thread_id", threadId).eq("user_id", userId);
  return error && !error.message.includes("duplicate key") ? fail(error.message) : { ok: true, data: undefined };
}

export async function submitReport(input: {
  userId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<Result> {
  const supabase = db();
  const { error } = await supabase.from("reports").insert({
    reporter_id: input.userId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    details: input.details?.trim() || null,
  });
  if (error?.message.includes("duplicate key")) return { ok: false, error: "report.alreadyReported" };
  return error ? fail(error.message) : { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

const MAX_EDGE = 2000;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/** Downscale + convert to WebP in the browser before upload. */
async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  if (blob && blob.type === "image/webp") return { blob, width, height };

  // Safari < 16 cannot encode WebP → JPEG fallback.
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!jpeg) throw new Error("encode");
  return { blob: jpeg, width, height };
}

export async function uploadImage(
  file: File,
  kind: "forum" | "avatar",
): Promise<Result<MediaItem>> {
  if (!file.type.startsWith("image/")) return { ok: false, error: "error.imageType" };
  if (file.size > MAX_INPUT_BYTES) return { ok: false, error: "error.imageTooLarge" };

  let payload: { blob: Blob; width: number; height: number };
  try {
    payload = await compressImage(file);
  } catch {
    return { ok: false, error: "error.imageType" };
  }

  const {
    data: { session },
  } = await createClient().auth.getSession();
  if (!session) return { ok: false, error: "error.signInRequired" };

  const form = new FormData();
  const extension = payload.blob.type === "image/webp" ? "webp" : "jpg";
  form.append("file", new File([payload.blob], `upload.${extension}`, { type: payload.blob.type }));
  form.append("kind", kind);
  form.append("width", String(payload.width));
  form.append("height", String(payload.height));

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eicbvvrayoubpbkuttmi.supabase.co";

  try {
    const response = await fetch(`${base.trim()}/functions/v1/moderate-upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: form,
    });
    const json = (await response.json().catch(() => ({}))) as {
      id?: string;
      url?: string;
      status?: MediaItem["status"];
      width?: number;
      height?: number;
      error?: string;
    };
    if (!response.ok || !json.id || !json.url) return fail(json.error ?? "UPLOAD_FAILED");
    return {
      ok: true,
      data: {
        id: json.id,
        url: json.url,
        status: json.status ?? "pending",
        width: json.width ?? payload.width,
        height: json.height ?? payload.height,
      },
    };
  } catch {
    return { ok: false, error: "error.network" };
  }
}

export async function removeUpload(id: string) {
  const supabase = db();
  await supabase.from("media_uploads").delete().eq("id", id);
}
