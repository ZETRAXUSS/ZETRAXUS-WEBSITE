"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, timeAgo, type TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import {
  createComment,
  deleteComment,
  editComment,
  fetchComment,
  fetchComments,
  fetchLiked,
  setLike,
  setSuggestionState,
} from "@/lib/projects/client";
import { containsLink } from "@/lib/projects/fields";
import type { CommentItem, CommentKind } from "@/lib/projects/types";
import { Markdown } from "@/components/forum/markdown";
import { MarkdownEditor } from "@/components/forum/markdown-editor";
import { ReportDialog } from "@/components/forum/report-dialog";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ChatIcon, CheckIcon, EditIcon, FlagIcon, SparkIcon, TrashIcon } from "@/components/ui/icons";
import { ErrorBox, LikeButton, ghostButton, solidButton } from "./ui";

const MAX = 5000;
type Filter = "all" | "suggestion" | "comment" | "added";
type Sort = "top" | "new" | "old";

export function CommentsSection({
  target,
  targetId,
  teamIds,
  canManage,
  canDeleteAll = false,
  ownerName,
  onCountChange,
}: {
  target: "project" | "creation";
  targetId: string;
  /** Owner + accepted members (shown with a "Team" badge). */
  teamIds: string[];
  /** May mark suggestions as added. */
  canManage: boolean;
  /** Project owner / creation author may remove any comment. */
  canDeleteAll?: boolean;
  ownerName?: string;
  onCountChange?: (delta: number) => void;
}) {
  const { user, profile, isStaff, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("top");
  const [kind, setKind] = useState<CommentKind>("suggestion");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [highlight, setHighlight] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setItems(await fetchComments(target, targetId));
    setLoading(false);
  }, [target, targetId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user || !items.length) return;
    fetchLiked(user.id, "comment", items.map((item) => item.id)).then(setLiked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, items.length]);

  // Deep link from notifications (#comment-…)
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith("comment-")) return;
    const id = hash.replace("comment-", "");
    const item = items.find((entry) => entry.id === id);
    if (item) setFilter("all");
    const timer = window.setTimeout(() => {
      const node = document.getElementById(hash);
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlight(hash);
        window.setTimeout(() => setHighlight(null), 2600);
      }
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Live comments
  useEffect(() => {
    const supabase = createClient();
    const column = target === "project" ? "project_id" : "creation_id";
    const channel = supabase
      .channel(`comments:${target}:${targetId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `${column}=eq.${targetId}` },
        async (payload) => {
          const id = (payload.new as { id?: string }).id;
          if (!id) return;
          const item = await fetchComment(id);
          if (!item) return;
          setItems((list) => {
            if (list.some((entry) => entry.id === item.id)) return list;
            onCountChange?.(1);
            return [...list, item];
          });
          setFresh((set) => new Set(set).add(item.id));
          if (item.author_id !== user?.id) playSound("notify");
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [target, targetId, user?.id, onCountChange]);

  const counts = useMemo(
    () => ({
      all: items.length,
      suggestion: items.filter((item) => item.kind === "suggestion").length,
      comment: items.filter((item) => item.kind === "comment").length,
      added: items.filter((item) => item.kind === "suggestion" && item.suggestion_state === "added").length,
    }),
    [items],
  );

  const visible = useMemo(() => {
    const list = items.filter((item) =>
      filter === "all"
        ? true
        : filter === "added"
          ? item.kind === "suggestion" && item.suggestion_state === "added"
          : item.kind === filter,
    );
    return [...list].sort((a, b) => {
      if (sort === "top") return b.like_count - a.like_count || +new Date(b.created_at) - +new Date(a.created_at);
      if (sort === "new") return +new Date(b.created_at) - +new Date(a.created_at);
      return +new Date(a.created_at) - +new Date(b.created_at);
    });
  }, [items, filter, sort]);

  const submit = async () => {
    if (!user) return;
    setError(null);
    if (!draft.trim()) return setError("error.bodyLength");
    if (containsLink(draft)) return setError("error.linksNotAllowed");
    setSending(true);
    const result = await createComment(target, targetId, kind, draft);
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      playSound("error");
      return;
    }
    playSound("success");
    setDraft("");
    const item = await fetchComment(result.data.id);
    if (item) {
      setItems((list) => {
        if (list.some((entry) => entry.id === item.id)) return list;
        onCountChange?.(1);
        return [...list, item];
      });
      setFresh((set) => new Set(set).add(item.id));
      setFilter("all");
      setSort("new");
      window.setTimeout(() => document.getElementById(`comment-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    }
  };

  const toggleLike = async (item: CommentItem) => {
    if (!user) return;
    const next = !liked.has(item.id);
    setLiked((set) => {
      const copy = new Set(set);
      if (next) copy.add(item.id);
      else copy.delete(item.id);
      return copy;
    });
    setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, like_count: Math.max(0, entry.like_count + (next ? 1 : -1)) } : entry)));
    await setLike("comment", item.id, user.id, next);
  };

  const toggleAdded = async (item: CommentItem) => {
    const next = item.suggestion_state === "added" ? "open" : "added";
    setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, suggestion_state: next } : entry)));
    const result = await setSuggestionState(item.id, next);
    if (!result.ok) {
      setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, suggestion_state: item.suggestion_state } : entry)));
      playSound("error");
    } else {
      playSound(next === "added" ? "success" : "toggle");
    }
  };

  const FILTERS: { id: Filter; label: TranslationKey }[] = [
    { id: "all", label: "comments.filter.all" },
    { id: "suggestion", label: "comments.filter.suggestions" },
    { id: "added", label: "comments.filter.added" },
    { id: "comment", label: "comments.filter.comments" },
  ];

  return (
    <section id="comments" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("comments.eyebrow")}</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
            {t("comments.title", { count: formatNumber(lang, items.length) })}
          </h2>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/[0.08] p-1">
          {(["top", "new", "old"] as Sort[]).map((value) => (
            <button
              key={value}
              type="button"
              data-sound="toggle"
              onClick={() => setSort(value)}
              className={`h-8 rounded-full px-3.5 text-[10px] font-semibold uppercase tracking-[1.5px] transition-all ${
                sort === value ? "bg-white/[0.12] text-white" : "text-white/35 hover:text-white/80"
              }`}
            >
              {t(`comments.sort.${value}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-sound="toggle"
            onClick={() => setFilter(item.id)}
            className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] transition-all duration-300 ${
              filter === item.id
                ? "border-white bg-white text-black"
                : "border-white/[0.12] text-white/45 hover:border-white/40 hover:text-white"
            }`}
          >
            {t(item.label)} <span className="ml-1 opacity-60">{counts[item.id]}</span>
          </button>
        ))}
      </div>

      {/* Composer */}
      <div ref={composerRef} className="mt-8">
        {authLoading ? null : !user ? (
          <div className="flex flex-col items-center gap-4 rounded-[24px] border border-white/[0.1] bg-[#060606] px-6 py-10 text-center">
            <p className="text-sm text-white/50">{t("comments.signIn")}</p>
            <Link href={`/auth/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/projects")}`} className={solidButton}>
              {t("auth.signIn")}
            </Link>
          </div>
        ) : profile?.is_banned ? (
          <ErrorBox>{t("error.banned")}</ErrorBox>
        ) : (
          <div className="rounded-[26px] border border-white/[0.1] bg-[#060606] p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={profile?.display_name ?? ""} src={profile?.avatar_url} size={32} ring />
                <p className="text-[12px] text-white/50">
                  {t(kind === "suggestion" ? "comments.suggestAs" : "comments.commentAs", { name: ownerName ?? "" })}
                </p>
              </div>
              <div className="relative grid grid-cols-2 rounded-full border border-white/[0.1] p-1">
                <span
                  className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ left: kind === "suggestion" ? "4px" : "50%" }}
                />
                {(["suggestion", "comment"] as CommentKind[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    data-sound="toggle"
                    onClick={() => setKind(value)}
                    className={`relative z-10 flex h-9 items-center justify-center gap-1.5 px-4 text-[10px] font-semibold uppercase tracking-[1.5px] transition-colors ${
                      kind === value ? "text-black" : "text-white/45 hover:text-white"
                    }`}
                  >
                    {value === "suggestion" ? <SparkIcon size={12} /> : <ChatIcon size={12} />}
                    {t(value === "suggestion" ? "comments.kind.suggestion" : "comments.kind.comment")}
                  </button>
                ))}
              </div>
            </div>
            <MarkdownEditor
              value={draft}
              onChange={setDraft}
              maxLength={MAX}
              rows={4}
              noLinks
              placeholder={t(kind === "suggestion" ? "comments.suggestionPh" : "comments.commentPh")}
              onSubmitShortcut={() => void submit()}
            />
            {error && (
              <div className="mt-4">
                <ErrorBox>{t(error)}</ErrorBox>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-[11px] text-white/25">{t(kind === "suggestion" ? "comments.suggestionHint" : "comments.commentHint")}</p>
              <button type="button" onClick={() => void submit()} disabled={sending || !draft.trim()} data-sound="off" className={solidButton}>
                {sending ? t("common.sending") : t(kind === "suggestion" ? "comments.postSuggestion" : "comments.postComment")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-8 space-y-4">
        {loading &&
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-[22px] border border-white/[0.06] p-7">
              <div className="flex items-center gap-3">
                <span className="zx-skeleton h-10 w-10 rounded-full" />
                <span className="zx-skeleton block h-3 w-40 rounded" />
              </div>
              <span className="zx-skeleton mt-6 block h-3 w-4/5 rounded" />
            </div>
          ))}

        {!loading && visible.length === 0 && (
          <p className="rounded-[20px] border border-dashed border-white/[0.1] px-6 py-12 text-center text-sm text-white/35">
            {t(filter === "all" ? "comments.empty" : "comments.emptyFilter")}
          </p>
        )}

        {visible.map((item, index) => (
          <CommentCard
            key={item.id}
            item={item}
            index={index}
            fresh={fresh.has(item.id)}
            highlighted={highlight === `comment-${item.id}`}
            liked={liked.has(item.id)}
            isTeam={teamIds.includes(item.author_id)}
            viewerId={user?.id}
            canManage={canManage}
            canModerate={isStaff || canDeleteAll}
            onLike={() => (user ? void toggleLike(item) : undefined)}
            onToggleAdded={() => void toggleAdded(item)}
            onReport={() => setReport(item.id)}
            onDelete={async () => {
              const result = await deleteComment(item.id);
              if (result.ok) {
                setItems((list) => list.filter((entry) => entry.id !== item.id));
                onCountChange?.(-1);
                playSound("close");
              }
            }}
            onSave={async (body) => {
              if (containsLink(body)) return "error.linksNotAllowed";
              const result = await editComment(item.id, body);
              if (result.ok) {
                setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, body, edited_at: new Date().toISOString() } : entry)));
                playSound("success");
                return null;
              }
              return result.error;
            }}
          />
        ))}
      </div>

      {report && <ReportDialog open={!!report} onClose={() => setReport(null)} targetType="comment" targetId={report} />}
    </section>
  );
}

function CommentCard({
  item,
  index,
  fresh,
  highlighted,
  liked,
  isTeam,
  viewerId,
  canManage,
  canModerate,
  onLike,
  onToggleAdded,
  onReport,
  onDelete,
  onSave,
}: {
  item: CommentItem;
  index: number;
  fresh: boolean;
  highlighted: boolean;
  liked: boolean;
  isTeam: boolean;
  viewerId?: string;
  canManage: boolean;
  canModerate: boolean;
  onLike: () => void;
  onToggleAdded: () => void;
  onReport: () => void;
  onDelete: () => Promise<void>;
  onSave: (body: string) => Promise<TranslationKey | null>;
}) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(item.body);
  const [error, setError] = useState<TranslationKey | null>(null);
  const mine = viewerId === item.author_id;
  const suggestion = item.kind === "suggestion";
  const added = suggestion && item.suggestion_state === "added";

  return (
    <article
      id={`comment-${item.id}`}
      data-spotlight
      className={`relative scroll-mt-24 overflow-hidden rounded-[22px] border bg-[#060606] transition-all duration-700 ${
        highlighted
          ? "border-white/60 shadow-[0_0_60px_rgba(255,255,255,0.12)]"
          : added
            ? "border-white/35 shadow-[0_0_40px_rgba(255,255,255,0.06)]"
            : fresh
              ? "zx-panel-in border-white/25"
              : "zx-rise-in border-white/[0.08] hover:border-white/[0.16]"
      }`}
      style={!fresh ? { animationDelay: `${Math.min(index, 8) * 40}ms` } : undefined}
    >
      {suggestion && <span className={`absolute inset-y-0 left-0 w-[3px] ${added ? "bg-white" : "bg-white/20"}`} />}
      <div className="relative z-[3] p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Link href={item.author ? `/u/${item.author.username}` : "#"} className="group flex items-center gap-3">
            <Avatar name={item.author?.display_name ?? "?"} src={item.author?.avatar_url} size={38} ring />
            <span>
              <span className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-white/85 group-hover:text-white">
                {item.author?.display_name ?? t("common.deletedUser")}
                {isTeam && (
                  <span className="rounded bg-white/90 px-1.5 text-[8px] font-bold uppercase tracking-[1px] text-black">{t("team.badge")}</span>
                )}
              </span>
              <span className="mt-0.5 block text-[11px] text-white/30">
                @{item.author?.username} · {timeAgo(lang, item.created_at)}
                {item.edited_at && ` · ${t("thread.edited")}`}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {suggestion && (
              <span
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[1.5px] ${
                  added ? "zx-pop border-white bg-white text-black" : "border-white/20 text-white/60"
                }`}
              >
                {added ? <CheckIcon size={10} /> : <SparkIcon size={10} />}
                {t(added ? "comments.added" : "comments.kind.suggestion")}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 md:pl-[50px]">
          {editing ? (
            <div className="space-y-4">
              <MarkdownEditor value={body} onChange={setBody} maxLength={MAX} rows={4} noLinks autoFocus />
              {error && <ErrorBox>{t(error)}</ErrorBox>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setBody(item.body);
                  }}
                  className={ghostButton}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!body.trim()) return setError("error.bodyLength");
                    const result = await onSave(body.trim());
                    if (result) setError(result);
                    else setEditing(false);
                  }}
                  className={solidButton}
                >
                  {t("common.save")}
                </button>
              </div>
            </div>
          ) : (
            <Markdown source={item.body} noLinks />
          )}

          {!editing && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <LikeButton liked={liked} count={item.like_count} onToggle={onLike} compact />

              {suggestion && canManage && (
                <button
                  type="button"
                  onClick={onToggleAdded}
                  data-sound="off"
                  className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[1px] transition-all duration-300 ${
                    added
                      ? "border-white/20 text-white/50 hover:border-white/40 hover:text-white"
                      : "border-white/40 text-white hover:bg-white hover:text-black"
                  }`}
                >
                  <CheckIcon size={11} />
                  {t(added ? "comments.unmark" : "comments.markAdded")}
                </button>
              )}

              <span className="flex-1" />

              {viewerId && !mine && (
                <button
                  type="button"
                  onClick={onReport}
                  aria-label={t("report.title")}
                  className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] text-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  <FlagIcon size={12} />
                </button>
              )}
              {mine && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={t("common.edit")}
                  className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] text-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  <EditIcon size={12} />
                </button>
              )}
              {(mine || canModerate) && (
                <ConfirmButton
                  onConfirm={onDelete}
                  confirmLabel={t("common.confirmDelete")}
                  title={t("common.delete")}
                  className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] text-white/30 hover:bg-white/[0.06] hover:text-white"
                  confirmClassName="flex h-8 items-center rounded-full border border-red-400/50 bg-red-500/10 px-3 text-[10px] font-semibold uppercase tracking-[1px] text-red-300"
                >
                  <TrashIcon size={12} />
                </ConfirmButton>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
