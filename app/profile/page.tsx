"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { CountUp } from "@/components/fx/count-up";
import { ThreadCard, ThreadCardSkeleton } from "@/components/forum/thread-card";
import {
  BookmarkIcon,
  ChatIcon,
  HeartIcon,
  ImageIcon,
  PinIcon,
  ShieldIcon,
  SparkIcon,
  UploadIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { getFollowerCount, getFollowingCount, updateProfile } from "@/lib/actions/profiles";
import { db } from "@/lib/supabase/client";
import { fetchThreads, setBookmark, uploadImage } from "@/lib/forum/client";
import type { ThreadSummary } from "@/lib/forum/types";
import { playSound } from "@/lib/sound/engine";

type Tab = "overview" | "posts" | "saved";

const BADGES: { key: string; icon: ReactNode; name: TranslationKey; desc: TranslationKey }[] = [
  { key: "joined", icon: <SparkIcon size={22} />, name: "badge.firstSteps", desc: "badge.firstStepsDesc" },
  { key: "firstThread", icon: <ChatIcon size={22} />, name: "badge.storyteller", desc: "badge.storytellerDesc" },
  { key: "tenReplies", icon: <PinIcon size={22} />, name: "badge.voiceHeard", desc: "badge.voiceHeardDesc" },
  { key: "liked", icon: <HeartIcon size={22} />, name: "badge.appreciated", desc: "badge.appreciatedDesc" },
  { key: "avatar", icon: <UserIcon size={22} />, name: "badge.identity", desc: "badge.identityDesc" },
  { key: "collector", icon: <BookmarkIcon size={22} />, name: "badge.collector", desc: "badge.collectorDesc" },
  { key: "visual", icon: <ImageIcon size={22} />, name: "badge.visual", desc: "badge.visualDesc" },
  { key: "staff", icon: <ShieldIcon size={22} />, name: "badge.guardian", desc: "badge.guardianDesc" },
];

interface Counts {
  threads: number;
  replies: number;
  likesReceived: number;
  saved: number;
  images: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, isStaff, refreshProfile } = useAuth();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "", bio: "" });
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarState, setAvatarState] = useState<"idle" | "uploading" | "pending" | "error">("idle");
  const [avatarError, setAvatarError] = useState<TranslationKey | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<ThreadSummary[] | null>(null);
  const [saved, setSaved] = useState<ThreadSummary[] | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login?next=/profile");
  }, [user, loading, router]);

  useEffect(() => {
    if (!profile) return;
    setEditForm({ display_name: profile.display_name, bio: profile.bio || "" });

    let active = true;
    (async () => {
      const supabase = db();
      const [followers, following, threads, replies, savedCount, images, likes] = await Promise.all([
        getFollowerCount(profile.id),
        getFollowingCount(profile.id),
        supabase.from("forum_threads").select("id", { count: "exact", head: true }).eq("author_id", profile.id),
        supabase.from("forum_replies").select("id", { count: "exact", head: true }).eq("author_id", profile.id),
        supabase.from("thread_bookmarks").select("thread_id", { count: "exact", head: true }).eq("user_id", profile.id),
        supabase.from("media_uploads").select("id", { count: "exact", head: true }).eq("owner_id", profile.id).eq("status", "approved"),
        supabase.from("forum_threads").select("like_count").eq("author_id", profile.id).limit(500),
      ]);
      if (!active) return;
      setFollowerCount(followers);
      setFollowingCount(following);
      setCounts({
        threads: threads.count ?? 0,
        replies: replies.count ?? 0,
        saved: savedCount.count ?? 0,
        images: images.count ?? 0,
        likesReceived: ((likes.data as { like_count: number }[] | null) ?? []).reduce((sum, row) => sum + row.like_count, 0),
      });
    })();

    return () => {
      active = false;
    };
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    if (activeTab === "posts" && posts === null) {
      fetchThreads({ sort: "new", authorUsername: profile.username, page: 0 }).then((result) => setPosts(result.items));
    }
    if (activeTab === "saved" && saved === null) {
      fetchThreads({ sort: "latest", savedBy: profile.id, page: 0 }).then((result) => setSaved(result.items));
    }
  }, [activeTab, profile, posts, saved]);

  async function handleSaveProfile() {
    if (!editForm.display_name.trim()) {
      setSaveError(t("profile.nameRequired"));
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const result = await updateProfile({
      display_name: editForm.display_name.trim().slice(0, 40),
      bio: editForm.bio.slice(0, 500),
    });
    setIsSaving(false);

    if (result.success) {
      await refreshProfile();
      setIsEditing(false);
      playSound("success");
    } else {
      setSaveError(result.error ?? t("error.generic"));
      playSound("error");
    }
  }

  async function handleAvatar(file: File) {
    setAvatarError(null);
    setAvatarState("uploading");
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    const result = await uploadImage(file, "avatar");
    if (!result.ok) {
      setAvatarState("error");
      setAvatarError(result.error);
      setAvatarPreview(null);
      URL.revokeObjectURL(preview);
      playSound("error");
      return;
    }

    if (result.data.status === "approved") {
      await refreshProfile();
      setAvatarState("idle");
      setAvatarPreview(null);
      playSound("success");
    } else {
      setAvatarState("pending");
      playSound("notify");
    }
    URL.revokeObjectURL(preview);
  }

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="h-8 w-8 animate-spin rounded-full border border-white/15 border-t-white" />
      </div>
    );
  }

  const unlocked: Record<string, boolean> = {
    joined: true,
    firstThread: (counts?.threads ?? 0) > 0,
    tenReplies: (counts?.replies ?? 0) >= 10,
    liked: (counts?.likesReceived ?? 0) >= 10,
    avatar: !!profile.avatar_url,
    collector: (counts?.saved ?? 0) >= 5,
    visual: (counts?.images ?? 0) > 0,
    staff: isStaff,
  };
  const unlockedCount = Object.values(unlocked).filter(Boolean).length;

  const xp = (counts?.threads ?? 0) * 40 + (counts?.replies ?? 0) * 12 + (counts?.likesReceived ?? 0) * 5 + unlockedCount * 25;
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 60)) + 1);
  const levelFloor = (level - 1) ** 2 * 60;
  const levelCeil = level ** 2 * 60;
  const xpPercent = Math.round(((xp - levelFloor) / Math.max(1, levelCeil - levelFloor)) * 100);

  const stats = [
    { label: t("profile.stats.threads"), value: counts?.threads ?? 0 },
    { label: t("profile.stats.replies"), value: counts?.replies ?? 0 },
    { label: t("profile.stats.likes"), value: counts?.likesReceived ?? 0 },
    { label: t("profile.stats.followers"), value: followerCount },
    { label: t("profile.stats.following"), value: followingCount },
    { label: t("profile.stats.saved"), value: counts?.saved ?? 0 },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: t("profile.tab.overview") },
    { id: "posts", label: t("profile.tab.posts") },
    { id: "saved", label: t("profile.tab.saved") },
  ];

  const roleLabel: Record<string, TranslationKey> = {
    admin: "role.admin",
    moderator: "role.moderator",
    creator: "role.creator",
    user: "role.user",
  };

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* BANNER */}
      <section className="px-4 pb-0 pt-6 md:px-6 md:pt-8">
        <div className="profile-banner group relative mx-auto w-full max-w-[1760px] overflow-hidden rounded-t-[32px] border border-b-0 border-white/[0.12] bg-[#030303]">
          <div className="relative h-[240px] w-full overflow-hidden md:h-[300px]">
            <ParallaxField />
            <StarField />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030303] to-transparent" />
          </div>

          <div className="absolute right-5 top-5 flex gap-2.5">
            {isStaff && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-full border border-white/[0.15] bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/70 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:text-white"
              >
                <ShieldIcon size={12} />
                {t("nav.admin")}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full border border-white/25 bg-white/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/[0.12]"
            >
              {isEditing ? t("common.cancel") : t("profile.edit")}
            </button>
          </div>
        </div>
      </section>

      {/* IDENTITY */}
      <section className="px-4 md:px-6">
        <div className="relative mx-auto w-full max-w-[1760px] rounded-b-[32px] border border-t-0 border-white/[0.12] bg-[#030303] px-6 pb-10 pt-0 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-20">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={avatarState === "uploading"}
                aria-label={t("profile.changeAvatar")}
                className="group/avatar relative flex h-32 w-32 items-center justify-center rounded-[28px] border-4 border-black bg-[#030303] shadow-[0_15px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.03] md:h-36 md:w-36"
              >
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] bg-white/[0.08] text-5xl font-black text-white/80 md:text-6xl">
                  {avatarPreview || profile.avatar_url ? (
                    <img
                      src={avatarPreview ?? profile.avatar_url ?? ""}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`h-full w-full object-cover ${avatarState === "uploading" ? "opacity-40 blur-[2px]" : ""}`}
                    />
                  ) : (
                    profile.display_name.charAt(0).toUpperCase()
                  )}
                </span>

                <span className="absolute inset-[4px] flex flex-col items-center justify-center gap-1.5 rounded-[24px] bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/avatar:opacity-100">
                  <UploadIcon size={18} />
                  <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-white/80">{t("profile.changeAvatar")}</span>
                </span>

                {avatarState === "uploading" && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="h-7 w-7 animate-spin rounded-full border border-white/20 border-t-white" />
                    <span className="text-[8px] uppercase tracking-[1.5px] text-white/80">{t("editor.scanning")}</span>
                  </span>
                )}

                <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white text-[11px] font-black text-black shadow-[0_0_18px_rgba(255,255,255,0.4)]">
                  {level}
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleAvatar(file);
                  event.target.value = "";
                }}
              />
            </div>

            {/* Edit */}
            {isEditing && (
              <div className="zx-rise-in min-w-0 flex-1 space-y-4 pt-2">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[2px] text-white/60">{t("profile.displayName")}</label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    maxLength={40}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm text-white outline-none transition-all focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[2px] text-white/60">{t("profile.bio")}</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    maxLength={500}
                    className="mt-1 w-full resize-none rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm text-white outline-none transition-all focus:border-white/30"
                  />
                  <p className="mt-1 text-[9px] text-white/30">{editForm.bio.length}/500</p>
                </div>

                {saveError && <p className="text-[12px] text-red-300">{saveError}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase transition-all hover:border-white/30 hover:bg-white/[0.06]"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    data-sound="off"
                    className="flex-1 rounded-lg border border-white/25 bg-white px-4 py-2 text-[10px] font-semibold uppercase text-black transition-all hover:bg-white/90 disabled:opacity-50"
                  >
                    {isSaving ? t("common.saving") : t("profile.saveChanges")}
                  </button>
                </div>
              </div>
            )}

            {/* View */}
            {!isEditing && (
              <div className="min-w-0 flex-1 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">{profile.display_name}</h1>
                  <span className="rounded-full border border-white/20 bg-white/[0.05] px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] text-white/60">
                    {t(roleLabel[profile.role] ?? "role.user")}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-white/30">@{profile.username}</p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">{profile.bio || t("profile.noBio")}</p>
              </div>
            )}
          </div>

          {(avatarState === "pending" || avatarError) && (
            <p
              className={`zx-rise-in mt-6 max-w-xl rounded-[14px] border px-4 py-3 text-[12px] ${
                avatarError ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-white/15 bg-white/[0.03] text-white/60"
              }`}
            >
              {avatarError ? t(avatarError) : t("profile.avatarPending")}
            </p>
          )}

          {/* XP bar */}
          <div className="mt-8 max-w-md">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[2px] text-white/30">
              <span>{t("profile.level", { level })}</span>
              <span className="text-white/50">{t("profile.toNextLevel", { percent: xpPercent, level: level + 1 })}</span>
            </div>
            <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="xp-fill h-full rounded-full bg-white/60 transition-[width] duration-1000 ease-out" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto w-full max-w-[1760px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 50}>
              <div
                data-spotlight
                className="relative overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#080808] px-4 py-6 text-center transition-all duration-500 hover:-translate-y-0.5 hover:border-white/[0.2]"
              >
                <p className="stat-glow relative z-[3] text-xl font-black text-white md:text-2xl">
                  <CountUp value={stat.value} />
                </p>
                <p className="relative z-[3] mt-1.5 text-[9px] uppercase tracking-[2px] text-white/30">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* TABS */}
      <section className="mx-auto w-full max-w-[1760px] px-6 md:px-10">
        <div className="flex gap-8 border-b border-white/[0.08]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                data-sound="toggle"
                className={`relative pb-4 text-[11px] font-medium uppercase tracking-[2px] transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute -bottom-px left-0 h-px w-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="mx-auto w-full max-w-[1760px] px-6 py-16 md:px-10 md:py-20">
        {activeTab === "overview" && (
          <div key="overview" className="zx-rise-in space-y-16">
            <div>
              <div className="mb-8 flex items-end justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("profile.achievements")}</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{t("profile.badges")}</h3>
                </div>
                <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
                  {unlockedCount} / {BADGES.length} {t("profile.unlocked")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                {BADGES.map((badge, index) => {
                  const on = unlocked[badge.key];
                  return (
                    <div
                      key={badge.key}
                      className={`zx-rise-in group/badge relative flex flex-col items-center gap-3 rounded-[18px] border p-5 text-center transition-all duration-500 ${
                        on
                          ? "border-white/[0.2] bg-white/[0.04] text-white hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,255,255,0.08)]"
                          : "border-white/[0.06] bg-white/[0.015] text-white/25"
                      }`}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 ${
                          on
                            ? "border-white/30 bg-white/[0.06] shadow-[0_0_24px_rgba(255,255,255,0.12)] group-hover/badge:scale-110 group-hover/badge:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                            : "border-white/[0.08]"
                        }`}
                      >
                        {badge.icon}
                      </span>
                      <span className={`text-[9px] font-semibold uppercase tracking-[1px] ${on ? "text-white/75" : "text-white/30"}`}>
                        {t(badge.name)}
                      </span>

                      <span className="pointer-events-none absolute -bottom-2 left-1/2 z-20 w-max max-w-[160px] -translate-x-1/2 translate-y-full rounded-[10px] border border-white/10 bg-black px-3 py-2 text-[10px] text-white/60 opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover/badge:opacity-100">
                        {t(badge.desc)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-8 border-b border-white/[0.08] pb-5">
                <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("profile.activityEyebrow")}</p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{t("profile.quickLinks")}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { href: "/forum?new=1", title: t("create.discussion"), desc: t("create.discussionDesc") },
                  { href: `/forum?author=${profile.username}`, title: t("profile.myThreads"), desc: t("profile.myThreadsDesc") },
                  { href: "/forum?view=saved", title: t("nav.saved"), desc: t("search.page.saved") },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-spotlight
                    className="group relative overflow-hidden rounded-[20px] border border-white/[0.1] bg-[#080808] p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/25"
                  >
                    <p className="relative z-[3] text-[12px] font-semibold uppercase tracking-[2px] text-white/80 group-hover:text-white">
                      {item.title}
                    </p>
                    <p className="relative z-[3] mt-2 text-[13px] text-white/35">{item.desc}</p>
                    <span className="relative z-[3] mt-5 inline-block text-white/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <TabList
            key="posts"
            items={posts}
            emptyTitle={t("profile.noPosts")}
            emptyAction={{ href: "/forum?new=1", label: t("forum.startFirst") }}
          />
        )}

        {activeTab === "saved" && (
          <TabList
            key="saved"
            items={saved}
            emptyTitle={t("forum.emptySaved")}
            emptyAction={{ href: "/forum", label: t("thread.backToForum") }}
            onUnsave={async (thread) => {
              setSaved((list) => (list ? list.filter((item) => item.id !== thread.id) : list));
              await setBookmark(thread.id, profile.id, false);
            }}
          />
        )}
      </section>

      <style>{`
        @keyframes stat-glow-pulse {
          0%, 100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
          50% { text-shadow: 0 0 18px rgba(255,255,255,0.35); }
        }
        .stat-glow { animation: stat-glow-pulse 4s ease-in-out infinite; }
        @keyframes xp-shimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
          100% { filter: brightness(1); }
        }
        .xp-fill { animation: xp-shimmer 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .stat-glow, .xp-fill { animation: none; }
        }
      `}</style>
    </div>
  );
}

function TabList({
  items,
  emptyTitle,
  emptyAction,
  onUnsave,
}: {
  items: ThreadSummary[] | null;
  emptyTitle: string;
  emptyAction: { href: string; label: string };
  onUnsave?: (thread: ThreadSummary) => void;
}) {
  if (items === null) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <ThreadCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="zx-rise-in rounded-[20px] border border-dashed border-white/[0.12] bg-[#070707] px-8 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] text-white/30">
          <ChatIcon size={16} />
        </span>
        <p className="mt-4 text-sm text-white/40">{emptyTitle}</p>
        <Link
          href={emptyAction.href}
          className="mt-6 inline-flex h-10 items-center rounded-full border border-white/20 px-5 text-[10px] font-semibold uppercase tracking-[2px] text-white/60 hover:border-white hover:text-white"
        >
          {emptyAction.label}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((thread, index) => (
        <ThreadCard key={thread.id} thread={thread} index={index} saved={!!onUnsave} onToggleSave={onUnsave} />
      ))}
    </div>
  );
}
