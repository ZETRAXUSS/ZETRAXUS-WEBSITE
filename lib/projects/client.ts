"use client";

import { db } from "@/lib/supabase/client";
import { errorKey, postContent, type Result } from "@/lib/forum/client";
import type {
  CommentItem,
  CommentKind,
  CreationDetail,
  CreationFields,
  CreationKind,
  CreationSummary,
  LikeTarget,
  ProjectDetail,
  ProjectMember,
  ProjectStatus,
  ProjectSummary,
  ProjectsStats,
} from "./types";

const PROFILE = "id, username, display_name, avatar_url, role";
const OWNER = `owner:profiles!projects_owner_id_fkey(${PROFILE})`;
const AUTHOR = `author:profiles!creations_author_id_fkey(${PROFILE})`;
const COMMENT_AUTHOR = `author:profiles!comments_author_id_fkey(${PROFILE})`;
const MEMBER_USER = `user:profiles!project_members_user_id_fkey(${PROFILE})`;

const PROJECT_FIELDS = `id, owner_id, title, tagline, genre, status, completed_at, cover_url, like_count, comment_count, view_count, created_at, updated_at, ${OWNER}, creations(count), members:project_members(count)`;
const CREATION_FIELDS = `id, kind, author_id, project_id, world_id, title, subtitle, type_tag, cover_url, map_url, planet_url, like_count, comment_count, view_count, created_at, updated_at, ${AUTHOR}, project:projects(id, title, status, owner_id)`;

export const PROJECTS_PAGE = 12;

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

function failWith<T>(message?: string | null): Result<T> {
  return { ok: false, error: errorKey(message) };
}

function sanitize(value: string) {
  return value.replace(/[,()%*\\:"'.]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export async function fetchProjectsStats(): Promise<ProjectsStats | null> {
  const { data } = await db().rpc("projects_stats");
  return (data as ProjectsStats | null) ?? null;
}

export async function incrementView(type: "project" | "creation", id: string) {
  const key = `zx-viewed-${type}-${id}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
  await db().rpc("increment_view", { p_type: type, p_id: id });
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type ProjectSort = "new" | "top" | "active" | "updated";

export interface ProjectQuery {
  status?: "all" | ProjectStatus;
  sort: ProjectSort;
  query?: string;
  /** Projects owned by or joined by this user. */
  memberId?: string;
  page: number;
  pageSize?: number;
}

export async function fetchProjects(options: ProjectQuery): Promise<{ items: ProjectSummary[]; hasMore: boolean }> {
  const supabase = db();
  const size = options.pageSize ?? PROJECTS_PAGE;
  let request = supabase.from("projects").select(PROJECT_FIELDS).eq("members.status", "accepted");

  if (options.status && options.status !== "all") request = request.eq("status", options.status);

  if (options.memberId) {
    const { data: joined } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", options.memberId)
      .eq("status", "accepted")
      .limit(200);
    const ids = ((joined as { project_id: string }[] | null) ?? []).map((row) => row.project_id);
    request = ids.length
      ? request.or(`owner_id.eq.${options.memberId},id.in.(${ids.join(",")})`)
      : request.eq("owner_id", options.memberId);
  }

  const q = sanitize(options.query ?? "");
  if (q.length >= 2) request = request.or(`title.ilike."%${q}%",tagline.ilike."%${q}%",genre.ilike."%${q}%"`);

  const ordered =
    options.sort === "top"
      ? request.order("like_count", { ascending: false }).order("created_at", { ascending: false })
      : options.sort === "active"
        ? request.order("comment_count", { ascending: false }).order("updated_at", { ascending: false })
        : options.sort === "updated"
          ? request.order("updated_at", { ascending: false })
          : request.order("created_at", { ascending: false });

  const from = options.page * size;
  const { data } = await ordered.range(from, from + size);
  const rows = (data as unknown as ProjectSummary[] | null) ?? [];
  return { items: rows.slice(0, size), hasMore: rows.length > size };
}

export async function fetchProject(id: string): Promise<ProjectDetail | null> {
  const { data } = await db()
    .from("projects")
    .select(`${PROJECT_FIELDS}, description, edited_at`)
    .eq("members.status", "accepted")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ProjectDetail | null) ?? null;
}

/** Projects the user can add creations to (owner or accepted member). */
export async function fetchEditableProjects(userId: string): Promise<{ id: string; title: string }[]> {
  const { items } = await fetchProjects({ sort: "updated", memberId: userId, page: 0, pageSize: 60 });
  return items.map((item) => ({ id: item.id, title: item.title }));
}

export interface ProjectInput {
  title: string;
  tagline: string;
  genre: string;
  description: string;
  status: ProjectStatus;
}

export async function saveProject(input: ProjectInput, id?: string): Promise<Result<{ id: string }>> {
  return postContent({
    action: id ? "edit_project" : "create_project",
    id,
    title: input.title.trim(),
    tagline: input.tagline.trim(),
    genre: input.genre.trim(),
    description: input.description.trim(),
    status: input.status,
  });
}

export async function setProjectStatus(id: string, status: ProjectStatus): Promise<Result> {
  const { error } = await db().from("projects").update({ status }).eq("id", id);
  return error ? failWith(error.message) : ok(undefined);
}

export async function deleteProject(id: string): Promise<Result> {
  const { error } = await db().from("projects").delete().eq("id", id);
  return error ? failWith(error.message) : ok(undefined);
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export async function fetchMembers(projectId: string): Promise<ProjectMember[]> {
  const { data } = await db()
    .from("project_members")
    .select(`project_id, user_id, status, created_at, ${MEMBER_USER}`)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  return (data as unknown as ProjectMember[] | null) ?? [];
}

export async function inviteMember(projectId: string, inviterId: string, username: string): Promise<Result> {
  const handle = username.trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) return { ok: false, error: "team.userNotFound" };
  const supabase = db();
  const { data: person } = await supabase.from("profiles").select("id").eq("username", handle).maybeSingle();
  if (!person) return { ok: false, error: "team.userNotFound" };
  const userId = (person as { id: string }).id;
  if (userId === inviterId) return { ok: false, error: "team.cannotInviteSelf" };

  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, user_id: userId, status: "pending", invited_by: inviterId });
  if (error?.message.includes("duplicate key")) return { ok: false, error: "team.alreadyMember" };
  return error ? failWith(error.message) : ok(undefined);
}

export async function acceptInvite(projectId: string, userId: string): Promise<Result> {
  const { error } = await db()
    .from("project_members")
    .update({ status: "accepted" })
    .eq("project_id", projectId)
    .eq("user_id", userId);
  return error ? failWith(error.message) : ok(undefined);
}

export async function removeMember(projectId: string, userId: string): Promise<Result> {
  const { error } = await db().from("project_members").delete().eq("project_id", projectId).eq("user_id", userId);
  return error ? failWith(error.message) : ok(undefined);
}

/* ------------------------------------------------------------------ */
/* Creations (worlds, lore, characters)                                */
/* ------------------------------------------------------------------ */

export type CreationSort = "new" | "top" | "updated";

export interface CreationQuery {
  kind?: CreationKind;
  sort: CreationSort;
  query?: string;
  projectId?: string;
  worldId?: string;
  authorId?: string;
  page: number;
  pageSize?: number;
  withFields?: boolean;
}

export async function fetchCreations(options: CreationQuery): Promise<{ items: CreationSummary[]; hasMore: boolean }> {
  const size = options.pageSize ?? PROJECTS_PAGE;
  let request = db()
    .from("creations")
    .select(options.withFields ? `${CREATION_FIELDS}, fields` : CREATION_FIELDS);

  if (options.kind) request = request.eq("kind", options.kind);
  if (options.projectId) request = request.eq("project_id", options.projectId);
  if (options.worldId) request = request.eq("world_id", options.worldId);
  if (options.authorId) request = request.eq("author_id", options.authorId);

  const q = sanitize(options.query ?? "");
  if (q.length >= 2) request = request.or(`title.ilike."%${q}%",subtitle.ilike."%${q}%",type_tag.ilike."%${q}%"`);

  const ordered =
    options.sort === "top"
      ? request.order("like_count", { ascending: false }).order("created_at", { ascending: false })
      : options.sort === "updated"
        ? request.order("updated_at", { ascending: false })
        : request.order("created_at", { ascending: false });

  const from = options.page * size;
  const { data } = await ordered.range(from, from + size);
  const rows = (data as unknown as CreationSummary[] | null) ?? [];
  return { items: rows.slice(0, size), hasMore: rows.length > size };
}

export async function fetchCreation(id: string): Promise<CreationDetail | null> {
  const { data } = await db()
    .from("creations")
    .select(`${CREATION_FIELDS}, fields, edited_at, world:creations!creations_world_id_fkey(id, title, planet_url)`)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as CreationDetail | null) ?? null;
}

/** Worlds the user may link a lore entry / character to. */
export async function fetchEditableWorlds(userId: string): Promise<{ id: string; title: string }[]> {
  const projects = await fetchEditableProjects(userId);
  let request = db().from("creations").select("id, title").eq("kind", "world");
  request = projects.length
    ? request.or(`author_id.eq.${userId},project_id.in.(${projects.map((p) => p.id).join(",")})`)
    : request.eq("author_id", userId);
  const { data } = await request.order("updated_at", { ascending: false }).limit(80);
  return (data as { id: string; title: string }[] | null) ?? [];
}

export interface CreationInput {
  kind: CreationKind;
  title: string;
  subtitle: string;
  typeTag: string;
  projectId: string | null;
  worldId: string | null;
  fields: CreationFields;
}

export async function saveCreation(input: CreationInput, id?: string): Promise<Result<{ id: string }>> {
  return postContent({
    action: id ? "edit_creation" : "create_creation",
    id,
    kind: input.kind,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    type_tag: input.typeTag.trim(),
    project_id: input.projectId,
    world_id: input.kind === "world" ? null : input.worldId,
    fields: input.fields,
  });
}

export async function deleteCreation(id: string): Promise<Result> {
  const { error } = await db().from("creations").delete().eq("id", id);
  return error ? failWith(error.message) : ok(undefined);
}

export async function clearCreationImage(id: string, column: "cover_url" | "map_url" | "planet_url"): Promise<Result> {
  const { error } = await db().from("creations").update({ [column]: null }).eq("id", id);
  return error ? failWith(error.message) : ok(undefined);
}

export async function clearProjectCover(id: string): Promise<Result> {
  const { error } = await db().from("projects").update({ cover_url: null }).eq("id", id);
  return error ? failWith(error.message) : ok(undefined);
}

export function creationHref(item: { id: string; kind: CreationKind }) {
  return `/${item.kind === "world" ? "worlds" : item.kind === "lore" ? "lore" : "characters"}/${item.id}`;
}

/* ------------------------------------------------------------------ */
/* Comments & suggestions                                              */
/* ------------------------------------------------------------------ */

export async function fetchComments(target: "project" | "creation", id: string): Promise<CommentItem[]> {
  const { data } = await db()
    .from("comments")
    .select(`id, project_id, creation_id, author_id, kind, body, suggestion_state, like_count, created_at, edited_at, ${COMMENT_AUTHOR}`)
    .eq(target === "project" ? "project_id" : "creation_id", id)
    .order("created_at", { ascending: true })
    .limit(500);
  return (data as unknown as CommentItem[] | null) ?? [];
}

export async function fetchComment(id: string): Promise<CommentItem | null> {
  const { data } = await db()
    .from("comments")
    .select(`id, project_id, creation_id, author_id, kind, body, suggestion_state, like_count, created_at, edited_at, ${COMMENT_AUTHOR}`)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as CommentItem | null) ?? null;
}

export async function createComment(
  target: "project" | "creation",
  id: string,
  kind: CommentKind,
  body: string,
): Promise<Result<{ id: string }>> {
  return postContent({ action: "create_comment", target, id, kind, body: body.trim() });
}

export async function editComment(id: string, body: string): Promise<Result> {
  const result = await postContent({ action: "edit_comment", id, body: body.trim() });
  return result.ok ? ok(undefined) : result;
}

export async function deleteComment(id: string): Promise<Result> {
  const { error } = await db().from("comments").delete().eq("id", id);
  return error ? failWith(error.message) : ok(undefined);
}

export async function setSuggestionState(id: string, state: "open" | "added"): Promise<Result> {
  const { data, error } = await db().from("comments").update({ suggestion_state: state }).eq("id", id).select("suggestion_state");
  if (error) return failWith(error.message);
  const row = (data as { suggestion_state: string }[] | null)?.[0];
  return row?.suggestion_state === state ? ok(undefined) : { ok: false, error: "error.forbidden" };
}

/* ------------------------------------------------------------------ */
/* Likes                                                               */
/* ------------------------------------------------------------------ */

export async function fetchLiked(userId: string, type: LikeTarget, ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const { data } = await db()
    .from("likes")
    .select("target_id")
    .eq("user_id", userId)
    .eq("target_type", type)
    .in("target_id", ids.slice(0, 300));
  return new Set(((data as { target_id: string }[] | null) ?? []).map((row) => row.target_id));
}

export async function setLike(type: LikeTarget, id: string, userId: string, liked: boolean): Promise<Result> {
  const supabase = db();
  const { error } = liked
    ? await supabase.from("likes").insert({ target_type: type, target_id: id, user_id: userId })
    : await supabase.from("likes").delete().eq("target_type", type).eq("target_id", id).eq("user_id", userId);
  return error && !error.message.includes("duplicate key") ? failWith(error.message) : ok(undefined);
}

export async function canEditCreation(id: string): Promise<boolean> {
  const { data } = await db().rpc("can_edit_creation", { c: id });
  return data === true;
}
