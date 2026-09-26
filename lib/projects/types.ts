import type { ForumAuthor } from "@/lib/forum/types";

export type CreationKind = "world" | "lore" | "character";
export type ProjectStatus = "in_progress" | "completed";
export type CommentKind = "comment" | "suggestion";
export type LikeTarget = "project" | "creation" | "comment";

export interface ProjectSummary {
  id: string;
  owner_id: string;
  title: string;
  tagline: string | null;
  genre: string | null;
  status: ProjectStatus;
  completed_at: string | null;
  cover_url: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  owner: ForumAuthor | null;
  creations?: { count: number }[];
  members?: { count: number }[];
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  edited_at: string | null;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  status: "pending" | "accepted";
  created_at: string;
  user: ForumAuthor | null;
}

export interface CityEntry {
  name: string;
  kind?: string;
  description?: string;
}

export interface KingdomEntry {
  name: string;
  ruler?: string;
  government?: string;
  description?: string;
}

export type CreationFields = Record<string, string | CityEntry[] | KingdomEntry[] | undefined>;

export interface CreationSummary {
  id: string;
  kind: CreationKind;
  author_id: string;
  project_id: string | null;
  world_id: string | null;
  title: string;
  subtitle: string | null;
  type_tag: string | null;
  cover_url: string | null;
  map_url: string | null;
  planet_url: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  author: ForumAuthor | null;
  project?: { id: string; title: string; status: ProjectStatus; owner_id?: string } | null;
  fields?: CreationFields;
}

export interface CreationDetail extends CreationSummary {
  fields: CreationFields;
  edited_at: string | null;
  world?: { id: string; title: string; planet_url: string | null } | null;
}

export interface CommentItem {
  id: string;
  project_id: string | null;
  creation_id: string | null;
  author_id: string;
  kind: CommentKind;
  body: string;
  suggestion_state: "open" | "added";
  like_count: number;
  created_at: string;
  edited_at: string | null;
  author: ForumAuthor | null;
}

export interface ProjectsStats {
  total: number;
  in_progress: number;
  completed: number;
  creators: number;
  worlds: number;
  lores: number;
  characters: number;
}
