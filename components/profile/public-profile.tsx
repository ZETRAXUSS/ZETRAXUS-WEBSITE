"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { StatStrip } from "@/components/profile/stat-strip";
import { ThreadCard, ThreadCardSkeleton } from "@/components/forum/thread-card";
import { ReportDialog } from "@/components/forum/report-dialog";
import { ArrowLeftIcon, ChatIcon, FlagIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { db } from "@/lib/supabase/client";
import { fetchThreads } from "@/lib/forum/client";
import type { ThreadSummary } from "@/lib/forum/types";
import { playSound } from "@/lib/sound/engine";

interface PublicProfileRow {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  is_banned: boolean;
  created_at: string;
}

const ROLE_KEYS: Record<string, TranslationKey> = {
  admin: "role.admin",
  moderator: "role.moderator",
  creator: "role.creator",
  user: "role.user",
};

export function PublicProfile({ username }: { username: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [profile, setProfile] = useState<PublicProfileRow | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [stats, setStats] = useState({ threads: 0, replies: 0, likes: 0, followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await db()
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, role, is_banned, created_at")
        .eq("username", username)
        .maybeSingle();
      if (!active) return;
      if (!data) {
        setStatus("missing");
        return;
      }
      const row = data as PublicProfileRow;
      setProfile(row);
      setStatus("ready");

      const [threadCount, replyCount, likes, followers, followingCount, list] = await Promise.all([
        db().from("forum_threads").select("id", { count: "exact", head: true }).eq("author_id", row.id),
        db().from("forum_replies").select("id", { count: "exact", head: true }).eq("author_id", row.id),
        db().from("forum_threads").select("like_count").eq("author_id", row.id).limit(500),
        db().from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", row.id),
        db().from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", row.id),
        fetchThreads({ sort: "new", authorUsername: row.username, page: 0 }),
      ]);
      if (!active) return;
      setStats({
        threads: threadCount.count ?? 0,
        replies: replyCount.count ?? 0,
        likes: ((likes.data as { like_count: number }[] | null) ?? []).reduce((sum, item) => sum + item.like_count, 0),
        followers: followers.count ?? 0,
        following: followingCount.count ?? 0,
      });
      setThreads(list.items);
    })();
    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    if (!user || !profile || user.id === profile.id) return;
    db()
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .maybeSingle()
      .then(({ data }: { data: unknown }) => setFollowing(!!data));
  }, [user, profile]);

  const toggleFollow = async () => {
    if (!profile) return;
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/u/${profile.username}`)}`);
      return;
    }
    setFollowBusy(true);
    const next = !following;
    const { error } = next
      ? await db().from("follows").insert({ follower_id: user.id, following_id: profile.id })
      : await db().from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
    setFollowBusy(false);
    if (!error || String(error.message).includes("duplicate key")) {
      setFollowing(next);
      setStats((current) => ({ ...current, followers: Math.max(0, current.followers + (next ? 1 : -1)) }));
      playSound(next ? "success" : "close");
    } else {
      playSound("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="h-8 w-8 animate-spin rounded-full border border-white/15 border-t-white" />
      </div>
    );
  }

  if (status === "missing" || !profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-[4px] text-white/30">404</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">{t("user.notFound")}</h1>
        <p className="mt-3 text-sm text-white/40">@{username}</p>
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

  const isMe = user?.id === profile.id;
  const joined = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(new Date(profile.created_at));
  const statCards = [
    { label: t("profile.stats.threads"), value: stats.threads },
    { label: t("profile.stats.replies"), value: stats.replies },
    { label: t("profile.stats.likes"), value: stats.likes },
    { label: t("profile.stats.followers"), value: stats.followers },
    { label: t("profile.stats.following"), value: stats.following },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* BANNER */}
      <section className="px-4 pb-0 pt-6 md:px-6 md:pt-8">
        <div className="group relative mx-auto w-full max-w-[1760px] overflow-hidden rounded-t-[32px] border border-b-0 border-white/[0.12] bg-[#030303]">
          <div className="relative h-[220px] w-full overflow-hidden md:h-[280px]">
            <ParallaxField />
            <StarField />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030303] to-transparent" />
          </div>

          <div className="absolute right-5 top-5 flex gap-2.5">
            {isMe ? (
              <Link
                href="/profile"
                className="rounded-full border border-white/25 bg-white/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/[0.12]"
              >
                {t("profile.edit")}
              </Link>
            ) : (
              <>
                {user && (
                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    aria-label={t("report.title")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.15] bg-black/40 text-white/50 backdrop-blur-md transition-all hover:border-white/40 hover:text-white"
                  >
                    <FlagIcon size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followBusy}
                  data-sound="off"
                  data-magnetic="0.2"
                  className={`rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[2px] backdrop-blur-md transition-all duration-300 disabled:opacity-50 ${
                    following
                      ? "border border-white/30 bg-white/[0.08] text-white hover:border-white/60"
                      : "bg-white text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
                  }`}
                >
                  {following ? t("user.following") : t("user.follow")}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* IDENTITY */}
      <section className="px-4 md:px-6">
        <div className="relative mx-auto w-full max-w-[1760px] rounded-b-[32px] border border-t-0 border-white/[0.12] bg-[#030303] px-6 pb-10 pt-0 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            <div className="relative -mt-16 md:-mt-20">
              <div className="flex h-32 w-32 items-center justify-center rounded-[28px] border-4 border-black bg-[#030303] shadow-[0_15px_50px_rgba(0,0,0,0.5)] md:h-36 md:w-36">
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] bg-white/[0.08] text-5xl font-black text-white/80 md:text-6xl">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    profile.display_name.charAt(0).toUpperCase()
                  )}
                </span>
              </div>
            </div>

            <div className="zx-rise-in min-w-0 flex-1 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">{profile.display_name}</h1>
                <span className="rounded-full border border-white/20 bg-white/[0.05] px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] text-white/60">
                  {t(ROLE_KEYS[profile.role] ?? "role.user")}
                </span>
                {profile.is_banned && (
                  <span className="rounded-full border border-red-400/40 px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] text-red-300">
                    {t("admin.banned")}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-white/30">
                @{profile.username} · {t("user.joined", { date: joined })}
              </p>
              <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/45">
                {profile.bio || t("user.noBio")}
              </p>
              <StatStrip items={statCards} />
            </div>
          </div>
        </div>
      </section>

      {/* POSTS */}
      <section className="mx-auto w-full max-w-[1760px] px-6 pb-24 pt-14 md:px-10 md:pt-16">
        <div className="mb-8 flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("forum.activityEyebrow")}</p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{t("user.posts")}</h3>
          </div>
          {stats.threads > 15 && (
            <Link
              href={`/forum?author=${profile.username}`}
              className="text-[10px] uppercase tracking-[2px] text-white/35 transition-colors hover:text-white"
            >
              {t("user.allPosts")} →
            </Link>
          )}
        </div>

        {threads === null && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <ThreadCardSkeleton key={i} />
            ))}
          </div>
        )}

        {threads?.length === 0 && (
          <div className="zx-rise-in rounded-[20px] border border-dashed border-white/[0.12] bg-[#070707] px-8 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] text-white/30">
              <ChatIcon size={16} />
            </span>
            <p className="mt-4 text-sm text-white/40">{t("user.noPosts")}</p>
          </div>
        )}

        <div className="space-y-3">
          {threads?.map((thread, index) => (
            <ThreadCard key={thread.id} thread={thread} index={index} />
          ))}
        </div>
      </section>

      {reportOpen && (
        <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={profile.id} />
      )}
    </div>
  );
}
