"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { timeAgo, type TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { CountUp } from "@/components/fx/count-up";
import { markdownExcerpt } from "@/components/forum/markdown";
import { CheckIcon, CloseIcon, FlagIcon, ImageIcon, SearchIcon, ShieldIcon, UserIcon } from "@/components/ui/icons";

type Tab = "reports" | "media" | "users";
type ReportStatus = "open" | "resolved" | "dismissed";

interface MiniProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  is_banned: boolean;
}

interface ReportRow {
  id: string;
  target_type: "thread" | "reply" | "user" | "media";
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  is_auto: boolean;
  created_at: string;
  reporter: MiniProfile | null;
}

interface TargetPreview {
  title?: string;
  body?: string;
  url?: string;
  href?: string;
  author?: MiniProfile | null;
  missing?: boolean;
}

interface MediaRow {
  id: string;
  url: string;
  kind: "forum" | "avatar";
  status: string;
  created_at: string;
  thread_id: string | null;
  reply_id: string | null;
  owner: MiniProfile | null;
}

const PROFILE_FIELDS = "id, username, display_name, avatar_url, role, is_banned";

export default function AdminPage() {
  const router = useRouter();
  const { user, isStaff, isAdmin, loading } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("reports");
  const [counts, setCounts] = useState({ reports: 0, media: 0, banned: 0, members: 0 });

  useEffect(() => {
    if (!loading && (!user || !isStaff)) router.replace("/");
  }, [loading, user, isStaff, router]);

  const loadCounts = useCallback(async () => {
    const supabase = db();
    const [reports, media, banned, members] = await Promise.all([
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("media_uploads").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_banned", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    setCounts({
      reports: reports.count ?? 0,
      media: media.count ?? 0,
      banned: banned.count ?? 0,
      members: members.count ?? 0,
    });
  }, []);

  useEffect(() => {
    if (isStaff) void loadCounts();
  }, [isStaff, loadCounts]);

  if (loading || !user || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="h-8 w-8 animate-spin rounded-full border border-white/15 border-t-white" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "reports", label: t("admin.tab.reports"), icon: <FlagIcon size={14} />, count: counts.reports },
    { id: "media", label: t("admin.tab.media"), icon: <ImageIcon size={14} />, count: counts.media },
    { id: "users", label: t("admin.tab.users"), icon: <UserIcon size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 pt-14 md:px-10 md:pt-20">
        <div className="zx-rise-in flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[5px] text-white/30">
              <ShieldIcon size={12} /> {t("admin.eyebrow")}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">{t("admin.title")}</h1>
            <p className="mt-4 max-w-xl text-sm text-white/40">{t("admin.subtitle")}</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: t("admin.stat.openReports"), value: counts.reports },
            { label: t("admin.stat.pendingMedia"), value: counts.media },
            { label: t("admin.stat.banned"), value: counts.banned },
            { label: t("admin.stat.members"), value: counts.members },
          ].map((stat, index) => (
            <div
              key={stat.label}
              data-spotlight
              className="zx-rise-in relative overflow-hidden rounded-[20px] border border-white/[0.1] bg-[#070707] px-6 py-6"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <p className="relative z-[3] text-3xl font-black">
                <CountUp value={stat.value} />
              </p>
              <p className="relative z-[3] mt-1 text-[9px] uppercase tracking-[2.5px] text-white/30">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex gap-2 overflow-x-auto border-b border-white/[0.08] pb-4">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              data-sound="toggle"
              className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[2px] transition-all duration-300 ${
                tab === item.id
                  ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.2)]"
                  : "border-white/[0.12] text-white/45 hover:border-white/40 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
              {!!item.count && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] ${tab === item.id ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="py-10">
          {tab === "reports" && <ReportsPanel onChange={loadCounts} />}
          {tab === "media" && <MediaPanel onChange={loadCounts} />}
          {tab === "users" && <UsersPanel isAdmin={isAdmin} selfId={user.id} onChange={loadCounts} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

function ReportsPanel({ onChange }: { onChange: () => void }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [status, setStatus] = useState<ReportStatus>("open");
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [targets, setTargets] = useState<Record<string, TargetPreview>>({});

  const load = useCallback(async () => {
    setRows(null);
    const supabase = db();
    const { data } = await supabase
      .from("reports")
      .select(`id, target_type, target_id, reason, details, status, is_auto, created_at, reporter:profiles!reports_reporter_id_fkey(${PROFILE_FIELDS})`)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(100);
    const list = (data as unknown as ReportRow[] | null) ?? [];
    setRows(list);

    const ids = (type: ReportRow["target_type"]) => [...new Set(list.filter((r) => r.target_type === type).map((r) => r.target_id))];
    const map: Record<string, TargetPreview> = {};

    const threadIds = ids("thread");
    if (threadIds.length) {
      const { data: threads } = await supabase
        .from("forum_threads")
        .select(`id, title, body, author:profiles!forum_threads_author_id_fkey(${PROFILE_FIELDS})`)
        .in("id", threadIds);
      ((threads as unknown as { id: string; title: string; body: string; author: MiniProfile }[] | null) ?? []).forEach((row) => {
        map[row.id] = { title: row.title, body: row.body, author: row.author, href: `/forum/${row.id}` };
      });
    }

    const replyIds = ids("reply");
    if (replyIds.length) {
      const { data: replies } = await supabase
        .from("forum_replies")
        .select(`id, body, thread_id, author:profiles!forum_replies_author_id_fkey(${PROFILE_FIELDS})`)
        .in("id", replyIds);
      ((replies as unknown as { id: string; body: string; thread_id: string; author: MiniProfile }[] | null) ?? []).forEach((row) => {
        map[row.id] = { body: row.body, author: row.author, href: `/forum/${row.thread_id}#reply-${row.id}` };
      });
    }

    const userIds = ids("user");
    if (userIds.length) {
      const { data: users } = await supabase.from("profiles").select(PROFILE_FIELDS).in("id", userIds);
      ((users as MiniProfile[] | null) ?? []).forEach((row) => {
        map[row.id] = { title: row.display_name, author: row, href: `/forum?author=${row.username}` };
      });
    }

    const mediaIds = ids("media");
    if (mediaIds.length) {
      const { data: media } = await supabase
        .from("media_uploads")
        .select(`id, url, owner:profiles!media_uploads_owner_id_fkey(${PROFILE_FIELDS})`)
        .in("id", mediaIds);
      ((media as unknown as { id: string; url: string; owner: MiniProfile }[] | null) ?? []).forEach((row) => {
        map[row.id] = { url: row.url, author: row.owner };
      });
    }

    list.forEach((row) => {
      if (!map[row.target_id]) map[row.target_id] = { missing: true };
    });
    setTargets(map);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const setReportStatus = async (row: ReportRow, next: ReportStatus) => {
    const supabase = db();
    await supabase
      .from("reports")
      .update({ status: next, resolved_by: user?.id ?? null, resolved_at: new Date().toISOString() })
      .eq("id", row.id);
    setRows((list) => (list ? list.filter((item) => item.id !== row.id) : list));
    playSound(next === "resolved" ? "success" : "close");
    onChange();
  };

  const removeTarget = async (row: ReportRow) => {
    const supabase = db();
    if (row.target_type === "thread") await supabase.from("forum_threads").delete().eq("id", row.target_id);
    if (row.target_type === "reply") await supabase.from("forum_replies").delete().eq("id", row.target_id);
    if (row.target_type === "media") await supabase.from("media_uploads").delete().eq("id", row.target_id);
    await setReportStatus(row, "resolved");
  };

  const banAuthor = async (row: ReportRow) => {
    const author = targets[row.target_id]?.author;
    if (!author) return;
    const supabase = db();
    const { error } = await supabase.rpc("set_user_ban", {
      p_user: author.id,
      p_banned: true,
      p_reason: `${row.reason}${row.details ? `: ${row.details}` : ""}`,
    });
    if (!error) {
      setTargets((map) => ({ ...map, [row.target_id]: { ...map[row.target_id], author: { ...author, is_banned: true } } }));
      playSound("success");
      onChange();
    } else {
      playSound("error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["open", "resolved", "dismissed"] as ReportStatus[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[2px] transition-all ${
              status === item ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white"
            }`}
          >
            {t(`admin.status.${item}` as TranslationKey)}
          </button>
        ))}
      </div>

      {rows === null && <PanelSkeleton />}
      {rows?.length === 0 && <EmptyPanel text={t("admin.noReports")} />}

      <div className="space-y-4">
        {rows?.map((row, index) => {
          const target = targets[row.target_id];
          return (
            <article
              key={row.id}
              className="zx-rise-in overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#070707]"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-6 py-4 text-[11px]">
                <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[1.5px] text-black">
                  {row.is_auto ? t("admin.autoReport") : t(`report.reason.${row.reason}` as TranslationKey)}
                </span>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-[9px] uppercase tracking-[1.5px] text-white/50">
                  {t(`admin.target.${row.target_type}` as TranslationKey)}
                </span>
                <span className="text-white/30">
                  {row.is_auto
                    ? t("admin.autoReportDesc", { name: row.reporter?.display_name ?? "?" })
                    : t("admin.reportedBy", { name: row.reporter?.display_name ?? "?" })}{" "}
                  · {timeAgo(lang, row.created_at)}
                </span>
              </div>

              <div className="grid gap-6 px-6 py-5 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  {!target ? (
                    <span className="zx-skeleton block h-12 rounded-lg" />
                  ) : target.missing ? (
                    <p className="text-sm text-white/30">{t("admin.targetMissing")}</p>
                  ) : (
                    <>
                      {target.author && (
                        <div className="mb-3 flex items-center gap-2">
                          <Avatar name={target.author.display_name} src={target.author.avatar_url} size={24} />
                          <span className="text-[12px] text-white/60">
                            {target.author.display_name} <span className="text-white/30">@{target.author.username}</span>
                          </span>
                          {target.author.is_banned && (
                            <span className="rounded border border-red-400/40 px-1.5 text-[8px] uppercase tracking-[1px] text-red-300">
                              {t("admin.banned")}
                            </span>
                          )}
                        </div>
                      )}
                      {target.title && <p className="font-semibold text-white/85">{target.title}</p>}
                      {target.body && <p className="mt-1 text-sm leading-6 text-white/45">{markdownExcerpt(target.body, 260)}</p>}
                      {target.url && <img src={target.url} alt="" className="mt-2 h-40 rounded-[12px] border border-white/10 object-cover" />}
                    </>
                  )}
                  {row.details && !row.is_auto && (
                    <p className="mt-4 rounded-[12px] border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[12px] italic text-white/50">
                      “{row.details}”
                    </p>
                  )}
                </div>

                {row.status === "open" && (
                  <div className="flex flex-wrap items-start gap-2 md:w-[260px] md:justify-end">
                    {target?.href && (
                      <Link href={target.href} target="_blank" className={smallButton}>
                        {t("admin.open")}
                      </Link>
                    )}
                    {!target?.missing && row.target_type !== "user" && (
                      <ConfirmButton
                        onConfirm={() => removeTarget(row)}
                        confirmLabel={t("common.confirmDelete")}
                        className={smallButton}
                        confirmClassName={dangerButton}
                      >
                        {t("admin.removeContent")}
                      </ConfirmButton>
                    )}
                    {target?.author && !target.author.is_banned && (
                      <ConfirmButton
                        onConfirm={() => banAuthor(row)}
                        confirmLabel={t("admin.confirmBan")}
                        className={smallButton}
                        confirmClassName={dangerButton}
                      >
                        {t("admin.banUser")}
                      </ConfirmButton>
                    )}
                    <button type="button" onClick={() => setReportStatus(row, "resolved")} className={`${smallButton} border-white/40 text-white`}>
                      <CheckIcon size={11} /> {t("admin.resolve")}
                    </button>
                    <button type="button" onClick={() => setReportStatus(row, "dismissed")} className={smallButton}>
                      {t("admin.dismiss")}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

function MediaPanel({ onChange }: { onChange: () => void }) {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<"pending" | "approved">("pending");
  const [rows, setRows] = useState<MediaRow[] | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    const supabase = db();
    const { data } = await supabase
      .from("media_uploads")
      .select(`id, url, kind, status, created_at, thread_id, reply_id, owner:profiles!media_uploads_owner_id_fkey(${PROFILE_FIELDS})`)
      .eq("status", filter)
      .order("created_at", { ascending: false })
      .limit(120);
    setRows((data as unknown as MediaRow[] | null) ?? []);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (row: MediaRow, approve: boolean) => {
    const supabase = db();
    const { error } = await supabase.rpc("moderate_media", { p_id: row.id, p_approve: approve });
    if (error) {
      playSound("error");
      return;
    }
    setRows((list) => (list ? list.filter((item) => item.id !== row.id) : list));
    playSound(approve ? "success" : "close");
    onChange();
  };

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["pending", "approved"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[2px] transition-all ${
              filter === item ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white"
            }`}
          >
            {t(item === "pending" ? "admin.media.pending" : "admin.media.approved")}
          </button>
        ))}
      </div>

      {rows === null && <PanelSkeleton />}
      {rows?.length === 0 && <EmptyPanel text={t("admin.noMedia")} />}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {rows?.map((row, index) => (
          <div
            key={row.id}
            className="zx-rise-in group overflow-hidden rounded-[20px] border border-white/[0.1] bg-[#070707]"
            style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
          >
            <a href={row.url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden bg-black">
              <img src={row.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </a>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-[11px] text-white/50">
                <Avatar name={row.owner?.display_name ?? "?"} src={row.owner?.avatar_url} size={20} />
                <span className="truncate">{row.owner?.display_name}</span>
                <span className="ml-auto shrink-0 text-white/25">{timeAgo(lang, row.created_at)}</span>
              </div>
              <p className="text-[9px] uppercase tracking-[2px] text-white/30">
                {t(row.kind === "avatar" ? "admin.media.avatar" : "admin.media.forum")}
              </p>
              <div className="flex gap-2">
                {filter === "pending" && (
                  <button type="button" onClick={() => decide(row, true)} data-sound="off" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-[10px] font-semibold uppercase tracking-[1.5px] text-black">
                    <CheckIcon size={12} /> {t("admin.approve")}
                  </button>
                )}
                <button type="button" onClick={() => decide(row, false)} data-sound="off" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 text-[10px] font-semibold uppercase tracking-[1.5px] text-white/60 hover:border-red-400/50 hover:text-red-300">
                  <CloseIcon size={12} /> {t("admin.reject")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

function UsersPanel({ isAdmin, selfId, onChange }: { isAdmin: boolean; selfId: string; onChange: () => void }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [onlyBanned, setOnlyBanned] = useState(false);
  const [rows, setRows] = useState<(MiniProfile & { created_at: string; banned_reason: string | null })[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = db();
    let request = supabase.from("profiles").select(`${PROFILE_FIELDS}, created_at, banned_reason`);
    const q = query.replace(/[,()%*\\:"'.]/g, " ").trim();
    if (q) request = request.or(`username.ilike."%${q}%",display_name.ilike."%${q}%"`);
    if (onlyBanned) request = request.eq("is_banned", true);
    const { data } = await request.order("created_at", { ascending: false }).limit(60);
    setRows((data as unknown as (MiniProfile & { created_at: string; banned_reason: string | null })[] | null) ?? []);
  }, [query, onlyBanned]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const ban = async (id: string, banned: boolean) => {
    setError(null);
    const supabase = db();
    const { error: rpcError } = await supabase.rpc("set_user_ban", { p_user: id, p_banned: banned, p_reason: banned ? "manual" : null });
    if (rpcError) {
      setError(rpcError.message);
      playSound("error");
      return;
    }
    setRows((list) => (list ? list.map((row) => (row.id === id ? { ...row, is_banned: banned } : row)) : list));
    playSound(banned ? "close" : "success");
    onChange();
  };

  const setRole = async (id: string, role: string) => {
    setError(null);
    const supabase = db();
    const { error: rpcError } = await supabase.rpc("set_user_role", { p_user: id, p_role: role });
    if (rpcError) {
      setError(rpcError.message);
      playSound("error");
      return;
    }
    setRows((list) => (list ? list.map((row) => (row.id === id ? { ...row, role } : row)) : list));
    playSound("success");
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 flex-1 items-center rounded-full border border-white/[0.12] bg-white/[0.025] focus-within:border-white/35 sm:max-w-md">
          <SearchIcon size={15} className="ml-4 text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("admin.searchUsers")}
            className="h-full flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-white/25"
          />
        </div>
        <button
          type="button"
          onClick={() => setOnlyBanned((value) => !value)}
          className={`h-11 rounded-full border px-5 text-[10px] font-semibold uppercase tracking-[2px] transition-all ${
            onlyBanned ? "border-white bg-white text-black" : "border-white/[0.12] text-white/45 hover:text-white"
          }`}
        >
          {t("admin.onlyBanned")}
        </button>
      </div>

      {error && <p className="mb-4 rounded-[12px] border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-300">{error}</p>}
      {rows === null && <PanelSkeleton />}
      {rows?.length === 0 && <EmptyPanel text={t("admin.noUsers")} />}

      <div className="overflow-hidden rounded-[22px] border border-white/[0.08]">
        {rows?.map((row, index) => (
          <div
            key={row.id}
            className="zx-rise-in flex flex-col gap-4 border-b border-white/[0.06] bg-[#070707] px-5 py-4 last:border-0 md:flex-row md:items-center"
            style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={row.display_name} src={row.avatar_url} size={36} ring />
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-[13px] font-semibold text-white/85">
                  {row.display_name}
                  {row.is_banned && (
                    <span className="rounded border border-red-400/40 px-1.5 text-[8px] uppercase tracking-[1px] text-red-300">{t("admin.banned")}</span>
                  )}
                </p>
                <p className="truncate text-[11px] text-white/30">
                  @{row.username}
                  {row.banned_reason ? ` · ${row.banned_reason}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && row.id !== selfId ? (
                <select
                  value={row.role}
                  onChange={(event) => setRole(row.id, event.target.value)}
                  className="h-9 rounded-full border border-white/[0.12] bg-black px-3 text-[10px] uppercase tracking-[1.5px] text-white/70 outline-none"
                >
                  {["user", "creator", "moderator", "admin"].map((role) => (
                    <option key={role} value={role}>
                      {t(`role.${role}` as TranslationKey)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="rounded-full border border-white/[0.1] px-3 py-2 text-[10px] uppercase tracking-[1.5px] text-white/40">
                  {t(`role.${row.role}` as TranslationKey)}
                </span>
              )}

              <Link href={`/u/${row.username}`} className={smallButton}>
                {t("admin.posts")}
              </Link>

              {row.id !== selfId &&
                (row.is_banned ? (
                  <button type="button" onClick={() => ban(row.id, false)} className={smallButton}>
                    {t("admin.unban")}
                  </button>
                ) : (
                  <ConfirmButton onConfirm={() => ban(row.id, true)} confirmLabel={t("admin.confirmBan")} className={smallButton} confirmClassName={dangerButton}>
                    {t("admin.banUser")}
                  </ConfirmButton>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const smallButton =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.14] px-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-white/60 transition-all hover:border-white/40 hover:text-white";
const dangerButton =
  "inline-flex h-9 items-center rounded-full border border-red-400/50 bg-red-500/10 px-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-red-300";

function PanelSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="zx-skeleton block h-24 rounded-[20px]" />
      ))}
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="zx-rise-in rounded-[22px] border border-dashed border-white/[0.12] px-6 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] text-white/40">
        <CheckIcon size={16} />
      </span>
      <p className="mt-4 text-sm text-white/40">{text}</p>
    </div>
  );
}
