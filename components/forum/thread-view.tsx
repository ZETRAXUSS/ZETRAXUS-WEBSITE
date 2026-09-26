"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, timeAgo, type TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import {
  createReply,
  deleteReply,
  deleteThread,
  fetchReplies,
  fetchReply,
  fetchThread,
  fetchViewerState,
  incrementView,
  setBookmark,
  setReplyLike,
  setThreadLike,
  updateReply,
  updateThread,
} from "@/lib/forum/client";
import type { MediaItem, ReplyItem, ThreadDetail } from "@/lib/forum/types";
import type { ForumAuthor } from "@/lib/forum/types";
import { Markdown } from "@/components/forum/markdown";
import { MarkdownEditor } from "@/components/forum/markdown-editor";
import { MediaGallery } from "@/components/forum/media-gallery";
import { ReportDialog } from "@/components/forum/report-dialog";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmButton } from "@/components/ui/confirm-button";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  ChatIcon,
  CheckIcon,
  EditIcon,
  EyeIcon,
  FlagIcon,
  HeartIcon,
  LockIcon,
  PinIcon,
  ReplyIcon,
  ShareIcon,
  TrashIcon,
} from "@/components/ui/icons";

const REPLY_MAX = 10000;

export function ThreadView({ id }: { id: string }) {
  const router = useRouter();
  const { user, profile, isStaff, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();

  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [burst, setBurst] = useState(0);
  const [copied, setCopied] = useState(false);
  const [report, setReport] = useState<{ type: "thread" | "reply"; id: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editError, setEditError] = useState<TranslationKey | null>(null);
  const [draft, setDraft] = useState("");
  const [draftMedia, setDraftMedia] = useState<MediaItem[]>([]);
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<TranslationKey | null>(null);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [highlight, setHighlight] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const data = await fetchThread(id);
    if (!data) {
      setStatus("missing");
      return;
    }
    setThread(data);
    setReplies(await fetchReplies(id));
    setStatus("ready");
  }, [id]);

  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      setStatus("missing");
      return;
    }
    void load();
    void incrementView(id);
  }, [id, load]);

  useEffect(() => {
    if (!user || status !== "ready") return;
    fetchViewerState(id, user.id).then((state) => {
      setLiked(state.liked);
      setBookmarked(state.bookmarked);
      setLikedReplies(state.likedReplies);
    });
  }, [user, id, status]);

  // Scroll to #reply-… from notifications
  useEffect(() => {
    if (status !== "ready") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const timer = window.setTimeout(() => {
      const node = document.getElementById(hash);
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlight(hash);
        window.setTimeout(() => setHighlight(null), 2600);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [status]);

  // Live replies
  useEffect(() => {
    if (status !== "ready") return;
    const supabase = createClient();
    const channel = supabase
      .channel(`thread:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "forum_replies", filter: `thread_id=eq.${id}` },
        async (payload) => {
          const replyId = (payload.new as { id?: string }).id;
          if (!replyId) return;
          const reply = await fetchReply(replyId);
          if (!reply) return;
          setReplies((list) => (list.some((item) => item.id === reply.id) ? list : [...list, reply]));
          setFreshIds((set) => new Set(set).add(reply.id));
          setThread((current) => (current ? { ...current, reply_count: current.reply_count + 1 } : current));
          if (reply.author_id !== user?.id) playSound("notify");
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, status, user?.id]);

  const requireUser = () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/forum/${id}`)}`);
      return false;
    }
    return true;
  };

  const toggleLike = async () => {
    if (!requireUser() || !thread || !user) return;
    const next = !liked;
    setLiked(next);
    setThread({ ...thread, like_count: Math.max(0, thread.like_count + (next ? 1 : -1)) });
    if (next) setBurst((value) => value + 1);
    const result = await setThreadLike(thread.id, user.id, next);
    if (!result.ok) {
      setLiked(!next);
      setThread((current) => (current ? { ...current, like_count: current.like_count + (next ? -1 : 1) } : current));
    }
  };

  const toggleBookmark = async () => {
    if (!requireUser() || !thread || !user) return;
    const next = !bookmarked;
    setBookmarked(next);
    const result = await setBookmark(thread.id, user.id, next);
    if (!result.ok) setBookmarked(!next);
  };

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: thread?.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      playSound("success");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* cancelled */
    }
  };

  const toggleReplyLike = async (reply: ReplyItem) => {
    if (!requireUser() || !user) return;
    const next = !likedReplies.has(reply.id);
    setLikedReplies((set) => {
      const copy = new Set(set);
      if (next) copy.add(reply.id);
      else copy.delete(reply.id);
      return copy;
    });
    setReplies((list) =>
      list.map((item) => (item.id === reply.id ? { ...item, like_count: Math.max(0, item.like_count + (next ? 1 : -1)) } : item)),
    );
    await setReplyLike(reply.id, user.id, next);
  };

  const saveEdit = async () => {
    if (!thread) return;
    setEditError(null);
    if (editTitle.trim().length < 3) return setEditError("error.titleLength");
    if (!editBody.trim()) return setEditError("error.bodyLength");
    const result = await updateThread(thread.id, { title: editTitle.trim(), body: editBody.trim() });
    if (!result.ok) {
      setEditError(result.error);
      playSound("error");
      return;
    }
    setThread({ ...thread, title: editTitle.trim(), body: editBody.trim(), edited_at: new Date().toISOString() });
    setEditing(false);
    playSound("success");
  };

  const removeThread = async () => {
    if (!thread) return;
    const result = await deleteThread(thread.id);
    if (result.ok) {
      playSound("close");
      router.push("/forum");
    }
  };

  const moderate = async (patch: { is_pinned?: boolean; is_locked?: boolean }) => {
    if (!thread) return;
    const result = await updateThread(thread.id, patch);
    if (result.ok) {
      setThread({ ...thread, ...patch });
      playSound("toggle");
    }
  };

  const submitReply = async () => {
    if (!requireUser() || !thread || !user) return;
    setReplyError(null);
    if (!draft.trim()) return setReplyError("error.bodyLength");
    setSending(true);
    const result = await createReply({
      userId: user.id,
      threadId: thread.id,
      body: draft,
      mediaIds: draftMedia.map((item) => item.id),
    });
    setSending(false);
    if (!result.ok) {
      setReplyError(result.error);
      playSound("error");
      return;
    }
    playSound("success");
    setDraft("");
    setDraftMedia([]);
    const reply = await fetchReply(result.data.id);
    if (reply) {
      setReplies((list) => (list.some((item) => item.id === reply.id) ? list : [...list, reply]));
      setFreshIds((set) => new Set(set).add(reply.id));
      setThread((current) => (current ? { ...current, reply_count: current.reply_count + 1 } : current));
      window.setTimeout(() => document.getElementById(`reply-${reply.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    }
  };

  const quote = (reply: ReplyItem | null) => {
    if (!requireUser()) return;
    const source = reply ? reply.body : thread?.body ?? "";
    const name = reply ? reply.author?.display_name : thread?.author?.display_name;
    const quoted = source
      .split("\n")
      .slice(0, 6)
      .map((line) => `> ${line}`)
      .join("\n");
    setDraft((current) => `${current ? `${current}\n\n` : ""}> **${name ?? ""}**\n${quoted}\n\n`);
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (status === "loading") return <ThreadSkeleton />;

  if (status === "missing" || !thread) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-[4px] text-white/30">404</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">{t("thread.notFound")}</h1>
        <p className="mt-3 text-sm text-white/40">{t("thread.notFoundDesc")}</p>
        <Link
          href="/forum"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/70 hover:border-white hover:bg-white hover:text-black"
        >
          <ArrowLeftIcon size={12} />
          {t("thread.backToForum")}
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === thread.author_id;
  const categoryName = lang === "tr" && thread.category?.name_tr ? thread.category.name_tr : thread.category?.name;
  const participants = uniqueAuthors([thread.author, ...replies.map((reply) => reply.author)]);
  const canReply = !!user && !profile?.is_banned && (!thread.is_locked || isStaff);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1360px] px-4 pt-10 md:px-6 md:pt-14">
        {/* breadcrumb */}
        <div className="zx-rise-in flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[2.5px] text-white/30">
          <Link href="/forum" className="group flex items-center gap-2 hover:text-white">
            <ArrowLeftIcon size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
            {t("nav.forum")}
          </Link>
          <span className="text-white/15">/</span>
          {thread.category && (
            <Link href={`/forum?category=${thread.category.slug}`} className="hover:text-white">
              {categoryName}
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* MAIN */}
          <div className="min-w-0">
            {/* Thread */}
            <article
              className="zx-rise-in relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#060606]"
              style={{ animationDelay: "60ms" }}
            >
              <div className="pointer-events-none absolute -top-40 left-1/3 h-80 w-[600px] rounded-full bg-white/[0.035] blur-[100px]" />

              <div className="relative p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  {thread.is_pinned && <Badge icon={<PinIcon size={10} />} label={t("forum.pinned")} strong />}
                  {thread.is_locked && <Badge icon={<LockIcon size={10} />} label={t("forum.locked")} />}
                </div>

                {editing ? (
                  <div className="space-y-5">
                    <input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value.slice(0, 200))}
                      className="h-14 w-full rounded-[16px] border border-white/[0.14] bg-white/[0.03] px-5 text-xl font-semibold text-white outline-none focus:border-white/35"
                    />
                    <MarkdownEditor value={editBody} onChange={setEditBody} maxLength={20000} rows={10} autoFocus onSubmitShortcut={() => void saveEdit()} />
                    {editError && <ErrorBox>{t(editError)}</ErrorBox>}
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setEditing(false)} className={ghostButton}>
                        {t("common.cancel")}
                      </button>
                      <button type="button" onClick={() => void saveEdit()} className={solidButton}>
                        {t("common.save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-[-0.03em] text-white md:text-5xl">
                      {thread.title}
                    </h1>

                    <AuthorLine
                      author={thread.author}
                      date={thread.created_at}
                      edited={thread.edited_at}
                      extra={
                        <span className="flex items-center gap-4 text-white/30">
                          <span className="flex items-center gap-1.5">
                            <EyeIcon size={12} /> {formatNumber(lang, thread.view_count)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ChatIcon size={12} /> {formatNumber(lang, thread.reply_count)}
                          </span>
                        </span>
                      }
                    />

                    <div className="mt-8 border-t border-white/[0.06] pt-8">
                      <Markdown source={thread.body} className="md:text-[16px]" />
                      <MediaGallery items={thread.media} viewerId={user?.id} />
                    </div>
                  </>
                )}

                {/* action bar */}
                {!editing && (
                  <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-6">
                    <button
                      type="button"
                      onClick={toggleLike}
                      aria-pressed={liked}
                      data-sound={liked ? "click" : "success"}
                      className={`relative flex h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-semibold transition-all duration-300 ${
                        liked
                          ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                          : "border-white/[0.12] text-white/60 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <span key={burst} className={`relative ${burst ? "zx-burst" : ""}`}>
                        <HeartIcon size={15} filled={liked} />
                        {burst > 0 && liked && (
                          <span className="zx-ripple absolute inset-0 rounded-full border border-current" />
                        )}
                      </span>
                      {formatNumber(lang, thread.like_count)}
                    </button>

                    <button
                      type="button"
                      onClick={toggleBookmark}
                      aria-pressed={bookmarked}
                      data-sound={bookmarked ? "close" : "success"}
                      className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-semibold transition-all duration-300 ${
                        bookmarked
                          ? "border-white/60 bg-white/[0.1] text-white"
                          : "border-white/[0.12] text-white/60 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <BookmarkIcon size={14} filled={bookmarked} />
                      {bookmarked ? t("forum.saved") : t("forum.save")}
                    </button>

                    <button type="button" onClick={share} data-sound="off" className={pillButton}>
                      {copied ? <CheckIcon size={14} /> : <ShareIcon size={14} />}
                      {copied ? t("thread.copied") : t("thread.share")}
                    </button>

                    <button type="button" onClick={() => quote(null)} className={pillButton}>
                      <ReplyIcon size={14} />
                      {t("thread.quote")}
                    </button>

                    <span className="flex-1" />

                    {user && !isAuthor && (
                      <button type="button" onClick={() => setReport({ type: "thread", id: thread.id })} className={iconButton} title={t("report.title")} aria-label={t("report.title")}>
                        <FlagIcon size={14} />
                      </button>
                    )}

                    {isStaff && (
                      <>
                        <button
                          type="button"
                          onClick={() => moderate({ is_pinned: !thread.is_pinned })}
                          className={`${iconButton} ${thread.is_pinned ? "border-white/50 text-white" : ""}`}
                          title={thread.is_pinned ? t("thread.unpin") : t("thread.pin")}
                          aria-label={thread.is_pinned ? t("thread.unpin") : t("thread.pin")}
                        >
                          <PinIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moderate({ is_locked: !thread.is_locked })}
                          className={`${iconButton} ${thread.is_locked ? "border-white/50 text-white" : ""}`}
                          title={thread.is_locked ? t("thread.unlock") : t("thread.lock")}
                          aria-label={thread.is_locked ? t("thread.unlock") : t("thread.lock")}
                        >
                          <LockIcon size={14} />
                        </button>
                      </>
                    )}

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditTitle(thread.title);
                          setEditBody(thread.body);
                          setEditing(true);
                        }}
                        className={iconButton}
                        title={t("common.edit")}
                        aria-label={t("common.edit")}
                      >
                        <EditIcon size={14} />
                      </button>
                    )}

                    {(isAuthor || isStaff) && (
                      <ConfirmButton
                        onConfirm={removeThread}
                        confirmLabel={t("common.confirmDelete")}
                        title={t("common.delete")}
                        className={iconButton}
                        confirmClassName="flex h-10 items-center rounded-full border border-red-400/50 bg-red-500/10 px-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-red-300"
                      >
                        <TrashIcon size={14} />
                      </ConfirmButton>
                    )}
                  </div>
                )}
              </div>
            </article>

            {/* Replies */}
            <div className="mt-14 flex items-end justify-between border-b border-white/[0.08] pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("thread.conversation")}</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em]">
                  {t("thread.replyCount", { count: formatNumber(lang, replies.length) })}
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {replies.length === 0 && (
                <p className="rounded-[20px] border border-dashed border-white/[0.1] px-6 py-12 text-center text-sm text-white/35">
                  {t("thread.noReplies")}
                </p>
              )}

              {replies.map((reply, index) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  index={index}
                  isOp={reply.author_id === thread.author_id}
                  fresh={freshIds.has(reply.id)}
                  highlighted={highlight === `reply-${reply.id}`}
                  liked={likedReplies.has(reply.id)}
                  viewerId={user?.id}
                  canModerate={isStaff}
                  onLike={() => toggleReplyLike(reply)}
                  onQuote={() => quote(reply)}
                  onReport={() => setReport({ type: "reply", id: reply.id })}
                  onDelete={async () => {
                    const result = await deleteReply(reply.id);
                    if (result.ok) {
                      setReplies((list) => list.filter((item) => item.id !== reply.id));
                      setThread((current) => (current ? { ...current, reply_count: Math.max(0, current.reply_count - 1) } : current));
                      playSound("close");
                    }
                  }}
                  onSave={async (body) => {
                    const result = await updateReply(reply.id, body);
                    if (result.ok) {
                      setReplies((list) =>
                        list.map((item) => (item.id === reply.id ? { ...item, body, edited_at: new Date().toISOString() } : item)),
                      );
                      playSound("success");
                    }
                    return result.ok ? null : result.error;
                  }}
                />
              ))}
            </div>

            {/* Composer */}
            <div ref={composerRef} className="mt-10 scroll-mt-24">
              {authLoading ? null : !user ? (
                <div className="flex flex-col items-center gap-4 rounded-[24px] border border-white/[0.1] bg-[#060606] px-6 py-10 text-center">
                  <p className="text-sm text-white/50">{t("thread.signInToReply")}</p>
                  <Link href={`/auth/login?next=${encodeURIComponent(`/forum/${id}`)}`} className={solidButton}>
                    {t("auth.signIn")}
                  </Link>
                </div>
              ) : profile?.is_banned ? (
                <ErrorBox>{t("error.banned")}</ErrorBox>
              ) : !canReply ? (
                <div className="flex items-center justify-center gap-2 rounded-[24px] border border-white/[0.1] bg-[#060606] px-6 py-8 text-sm text-white/40">
                  <LockIcon size={14} /> {t("thread.lockedNotice")}
                </div>
              ) : (
                <div className="rounded-[26px] border border-white/[0.1] bg-[#060606] p-5 md:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar name={profile?.display_name ?? ""} src={profile?.avatar_url} size={32} ring />
                    <p className="text-[12px] text-white/50">{t("thread.replyAs", { name: profile?.display_name ?? "" })}</p>
                  </div>
                  <MarkdownEditor
                    value={draft}
                    onChange={setDraft}
                    placeholder={t("thread.replyPlaceholder")}
                    maxLength={REPLY_MAX}
                    rows={4}
                    attachments={draftMedia}
                    onAttachmentsChange={setDraftMedia}
                    maxAttachments={4}
                    onSubmitShortcut={() => void submitReply()}
                  />
                  {replyError && <div className="mt-4"><ErrorBox>{t(replyError)}</ErrorBox></div>}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void submitReply()}
                      disabled={sending || !draft.trim()}
                      data-sound="off"
                      data-magnetic="0.15"
                      className={`${solidButton} disabled:opacity-40`}
                    >
                      {sending ? t("common.sending") : t("thread.postReply")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ASIDE */}
          <aside className="hidden xl:block">
            <div className="sticky top-8 space-y-4">
              <div className="zx-rise-in rounded-[24px] border border-white/[0.1] bg-[#060606] p-6" style={{ animationDelay: "140ms" }}>
                <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("thread.about")}</p>
                <dl className="mt-5 space-y-3 text-[12px]">
                  <InfoRow label={t("forum.category")} value={categoryName ?? "—"} />
                  <InfoRow label={t("thread.started")} value={timeAgo(lang, thread.created_at)} />
                  <InfoRow label={t("thread.lastActivity")} value={timeAgo(lang, thread.last_activity_at)} />
                  <InfoRow label={t("forum.views")} value={formatNumber(lang, thread.view_count)} />
                  <InfoRow label={t("forum.likes")} value={formatNumber(lang, thread.like_count)} />
                </dl>
              </div>

              <div className="zx-rise-in rounded-[24px] border border-white/[0.1] bg-[#060606] p-6" style={{ animationDelay: "200ms" }}>
                <p className="text-[9px] uppercase tracking-[3px] text-white/25">
                  {t("thread.participants")} · {participants.length}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {participants.slice(0, 18).map((person) => (
                    <Link key={person.id} href={`/forum?author=${person.username}`} title={person.display_name} className="transition-transform duration-300 hover:-translate-y-0.5">
                      <Avatar name={person.display_name} src={person.avatar_url} size={34} ring />
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/forum"
                className="group flex items-center justify-between rounded-[20px] border border-white/[0.08] px-5 py-4 text-[11px] uppercase tracking-[2px] text-white/40 transition-all hover:border-white/25 hover:text-white"
              >
                {t("thread.backToForum")}
                <ArrowLeftIcon size={12} className="rotate-180 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {report && (
        <ReportDialog open={!!report} onClose={() => setReport(null)} targetType={report.type} targetId={report.id} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const pillButton =
  "flex h-10 items-center gap-2 rounded-full border border-white/[0.12] px-4 text-[11px] font-semibold text-white/60 transition-all duration-300 hover:border-white/40 hover:text-white";
const iconButton =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] text-white/45 transition-all duration-300 hover:border-white/40 hover:text-white";
const solidButton =
  "inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-[10px] font-semibold uppercase tracking-[2px] text-black transition-all hover:shadow-[0_0_28px_rgba(255,255,255,0.28)]";
const ghostButton =
  "inline-flex h-11 items-center justify-center rounded-full border border-white/[0.14] px-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white";

function uniqueAuthors(list: (ForumAuthor | null)[]) {
  const seen = new Map<string, ForumAuthor>();
  list.forEach((author) => {
    if (author && !seen.has(author.id)) seen.set(author.id, author);
  });
  return Array.from(seen.values());
}

function Badge({ icon, label, strong }: { icon: React.ReactNode; label: string; strong?: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[1.5px] ${
        strong ? "border-white/30 bg-white/[0.08] text-white/85" : "border-white/15 text-white/45"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="zx-rise-in rounded-[14px] border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-300">{children}</p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-white/30">{label}</dt>
      <dd className="truncate text-right text-white/70">{value}</dd>
    </div>
  );
}

function AuthorLine({
  author,
  date,
  edited,
  extra,
  isOp,
}: {
  author: ForumAuthor | null;
  date: string;
  edited: string | null;
  extra?: React.ReactNode;
  isOp?: boolean;
}) {
  const { t, lang } = useI18n();
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
      <Link href={author ? `/forum?author=${author.username}` : "/forum"} className="group flex items-center gap-3">
        <Avatar name={author?.display_name ?? "?"} src={author?.avatar_url} size={40} ring />
        <span>
          <span className="flex items-center gap-2 text-[13px] font-semibold text-white/85 group-hover:text-white">
            {author?.display_name ?? t("common.deletedUser")}
            {(author?.role === "admin" || author?.role === "moderator") && (
              <span className="rounded border border-white/20 px-1.5 text-[8px] font-bold uppercase tracking-[1px] text-white/60">
                {t(author.role === "admin" ? "role.admin" : "role.moderator")}
              </span>
            )}
            {isOp && (
              <span className="rounded bg-white/90 px-1.5 text-[8px] font-bold uppercase tracking-[1px] text-black">OP</span>
            )}
          </span>
          <span className="mt-0.5 block text-[11px] text-white/30">
            @{author?.username} · {timeAgo(lang, date)}
            {edited && ` · ${t("thread.edited")}`}
          </span>
        </span>
      </Link>
      {extra && <span className="ml-auto text-[11px]">{extra}</span>}
    </div>
  );
}

function ReplyCard({
  reply,
  index,
  isOp,
  fresh,
  highlighted,
  liked,
  viewerId,
  canModerate,
  onLike,
  onQuote,
  onReport,
  onDelete,
  onSave,
}: {
  reply: ReplyItem;
  index: number;
  isOp: boolean;
  fresh: boolean;
  highlighted: boolean;
  liked: boolean;
  viewerId?: string;
  canModerate: boolean;
  onLike: () => void;
  onQuote: () => void;
  onReport: () => void;
  onDelete: () => Promise<void>;
  onSave: (body: string) => Promise<TranslationKey | null>;
}) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(reply.body);
  const [error, setError] = useState<TranslationKey | null>(null);
  const mine = viewerId === reply.author_id;

  return (
    <article
      id={`reply-${reply.id}`}
      data-spotlight
      className={`relative scroll-mt-24 overflow-hidden rounded-[22px] border bg-[#060606] transition-all duration-700 ${
        highlighted
          ? "border-white/60 shadow-[0_0_60px_rgba(255,255,255,0.12)]"
          : fresh
            ? "zx-panel-in border-white/25"
            : "zx-rise-in border-white/[0.08] hover:border-white/[0.16]"
      }`}
      style={!fresh ? { animationDelay: `${Math.min(index, 8) * 40}ms` } : undefined}
    >
      <div className="relative z-[3] p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <AuthorLine author={reply.author} date={reply.created_at} edited={reply.edited_at} isOp={isOp} />
          <span className="mt-6 font-mono text-[10px] text-white/15">#{index + 1}</span>
        </div>

        <div className="mt-5 md:pl-[52px]">
          {editing ? (
            <div className="space-y-4">
              <MarkdownEditor value={body} onChange={setBody} maxLength={REPLY_MAX} rows={4} autoFocus />
              {error && <ErrorBox>{t(error)}</ErrorBox>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setEditing(false); setBody(reply.body); }} className={ghostButton}>
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
            <>
              <Markdown source={reply.body} />
              <MediaGallery items={reply.media} viewerId={viewerId} />
            </>
          )}

          {!editing && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onLike}
                aria-pressed={liked}
                data-sound={liked ? "click" : "success"}
                className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-all duration-300 ${
                  liked ? "bg-white text-black" : "text-white/40 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <HeartIcon size={13} filled={liked} className={liked ? "zx-burst" : ""} />
                {reply.like_count > 0 && formatNumber(lang, reply.like_count)}
              </button>
              <button type="button" onClick={onQuote} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] text-white/40 hover:bg-white/[0.06] hover:text-white">
                <ReplyIcon size={13} />
                {t("thread.quote")}
              </button>
              {viewerId && !mine && (
                <button type="button" onClick={onReport} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] text-white/30 hover:bg-white/[0.06] hover:text-white" aria-label={t("report.title")}>
                  <FlagIcon size={12} />
                </button>
              )}
              {mine && (
                <button type="button" onClick={() => setEditing(true)} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] text-white/30 hover:bg-white/[0.06] hover:text-white" aria-label={t("common.edit")}>
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

function ThreadSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 pt-14 md:px-6">
      <span className="zx-skeleton block h-3 w-40 rounded" />
      <div className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#060606] p-10">
        <span className="zx-skeleton block h-10 w-3/4 rounded-lg" />
        <div className="mt-8 flex items-center gap-3">
          <span className="zx-skeleton h-10 w-10 rounded-full" />
          <span className="zx-skeleton block h-3 w-40 rounded" />
        </div>
        <div className="mt-10 space-y-3">
          <span className="zx-skeleton block h-3 w-full rounded" />
          <span className="zx-skeleton block h-3 w-11/12 rounded" />
          <span className="zx-skeleton block h-3 w-4/5 rounded" />
        </div>
      </div>
    </div>
  );
}
