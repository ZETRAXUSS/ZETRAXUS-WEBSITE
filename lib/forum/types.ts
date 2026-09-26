export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  name_tr: string | null;
  description_tr: string | null;
  sort_order: number;
}

export interface ForumAuthor {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: "user" | "creator" | "moderator" | "admin";
}

export interface MediaItem {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  status: "approved" | "pending" | "rejected";
  owner_id?: string;
}

export interface ThreadSummary {
  id: string;
  title: string;
  body: string;
  created_at: string;
  last_activity_at: string;
  edited_at: string | null;
  reply_count: number;
  like_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  category: Pick<ForumCategory, "id" | "name" | "name_tr" | "slug"> | null;
  author: ForumAuthor | null;
  media: { count: number }[];
}

export interface ThreadDetail extends Omit<ThreadSummary, "media"> {
  author_id: string;
  category_id: string;
  media: MediaItem[];
}

export interface ReplyItem {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
  edited_at: string | null;
  like_count: number;
  author: ForumAuthor | null;
  media: MediaItem[];
}

export type ThreadSort = "latest" | "new" | "active" | "top" | "unanswered";

export interface ForumStats {
  threads: number;
  replies: number;
  members: number;
  categories: { id: string; threads: number; replies: number }[];
}

export type ReportReason = "spam" | "harassment" | "nsfw" | "violence" | "misinformation" | "other";
export type ReportTarget = "thread" | "reply" | "user" | "media";
