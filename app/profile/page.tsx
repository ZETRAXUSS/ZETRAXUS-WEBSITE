"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { useAuth } from "@/lib/auth/use-auth";
import { getFollowerCount, getFollowingCount, updateProfile } from "@/lib/actions/profiles";

const avatarPresets = [
  { id: "spark", icon: "⚡", tone: "bg-white/[0.14] text-white/85" },
  { id: "moon", icon: "🌙", tone: "bg-white/[0.1] text-white/75" },
  { id: "flame", icon: "🔥", tone: "bg-white/[0.16] text-white/85" },
  { id: "star", icon: "⭐", tone: "bg-white/[0.12] text-white/80" },
  { id: "wolf", icon: "🐺", tone: "bg-white/[0.1] text-white/70" },
  { id: "owl", icon: "🦉", tone: "bg-white/[0.14] text-white/80" },
  { id: "dragon", icon: "🐉", tone: "bg-white/[0.16] text-white/85" },
  { id: "wave", icon: "🌊", tone: "bg-white/[0.1] text-white/70" },
  { id: "mask", icon: "🎭", tone: "bg-white/[0.12] text-white/78" },
  { id: "shield", icon: "🛡️", tone: "bg-white/[0.14] text-white/82" },
  { id: "comet", icon: "☄️", tone: "bg-white/[0.1] text-white/72" },
  { id: "crystal", icon: "🔮", tone: "bg-white/[0.16] text-white/85" },
];

const defaultStats = [
  { label: "Projects", value: "—" },
  { label: "Followers", value: "—" },
  { label: "Following", value: "—" },
  { label: "Worlds", value: "—" },
  { label: "Posts", value: "—" },
  { label: "Shop Items", value: "—" },
];

const badges = [
  { icon: "🌱", name: "First Steps", desc: "Joined ZETRAXUS", unlocked: true },
  { icon: "✍️", name: "Storyteller", desc: "Publish your first story", unlocked: false },
  { icon: "🌍", name: "Worldbuilder", desc: "Create your first world", unlocked: false },
  { icon: "🎭", name: "Character Smith", desc: "Design 5 characters", unlocked: false },
  { icon: "💬", name: "Voice Heard", desc: "Post 10 forum replies", unlocked: false },
  { icon: "🛒", name: "Entrepreneur", desc: "List your first product", unlocked: false },
  { icon: "🔥", name: "On Fire", desc: "7 day activity streak", unlocked: false },
  { icon: "👑", name: "Legend", desc: "Reach Level 25", unlocked: false },
];

const tabs = ["Overview", "Projects", "Activity", "Saved"];

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(avatarPresets[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "", bio: "" });
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/login");
    }
  }, [user, loading]);

  // Load profile data and counts
  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name,
        bio: profile.bio || "",
      });

      async function loadCounts() {
        const followers = await getFollowerCount(profile.id);
        const following = await getFollowingCount(profile.id);
        setFollowerCount(followers);
        setFollowingCount(following);
      }

      loadCounts();
    }
  }, [profile]);

  async function handleSaveProfile() {
    if (!editForm.display_name.trim()) {
      alert("Display name cannot be empty");
      return;
    }

    setIsSaving(true);
    const result = await updateProfile({
      display_name: editForm.display_name,
      bio: editForm.bio,
    });

    if (result.success) {
      setIsEditing(false);
    } else {
      alert("Error saving profile: " + result.error);
    }
    setIsSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const level = 1;
  const xpPercent = 12;

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* =========================================================
          BANNER (site-generated, no uploads)
      ========================================================== */}

      <section className="px-4 pb-0 pt-6 md:px-6 md:pt-8">
        <div className="profile-banner group relative mx-auto w-full max-w-[1760px] overflow-hidden rounded-t-[32px] border border-b-0 border-white/[0.12] bg-[#030303]">
          <div className="relative h-[240px] w-full overflow-hidden md:h-[300px]">
            <ParallaxField />
            <StarField />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030303] to-transparent" />
          </div>

          <div className="absolute right-5 top-5 flex gap-2.5">
            <button
              type="button"
              disabled
              className="rounded-full border border-white/[0.15] bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/50 opacity-70 backdrop-blur-md transition-all duration-300 cursor-not-allowed"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full border border-white/25 bg-white/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/80 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.12] hover:border-white/40"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          IDENTITY BLOCK
      ========================================================== */}

      <section className="px-4 md:px-6">
        <div className="relative mx-auto w-full max-w-[1760px] rounded-b-[32px] border border-t-0 border-white/[0.12] bg-[#030303] px-6 pb-10 pt-0 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            {/* Avatar (preset-only, click to open picker) */}
            <div className="relative -mt-16 md:-mt-20">
              <button
                type="button"
                onClick={() => setShowAvatarPicker((prev) => !prev)}
                className="group/avatar relative flex h-32 w-32 items-center justify-center rounded-[28px] border-4 border-black bg-[#030303] shadow-[0_15px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.03] md:h-36 md:w-36"
              >
                <div
                  className={`flex h-full w-full items-center justify-center rounded-[24px] text-5xl md:text-6xl ${selectedAvatar.tone}`}
                >
                  {selectedAvatar.icon}
                </div>

                <span className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-[1px] text-white/70 opacity-0 transition-opacity duration-300 group-hover/avatar:opacity-100">
                  Change
                </span>

                <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white text-[11px] font-black text-black shadow-[0_0_18px_rgba(255,255,255,0.4)]">
                  {level}
                </span>
              </button>
            </div>

            {/* Name & bio - Edit Mode */}
            {isEditing && (
              <div className="min-w-0 flex-1 pt-2 space-y-4">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[2px] text-white/60">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, display_name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm text-white outline-none transition-all focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium uppercase tracking-[2px] text-white/60">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    maxLength={500}
                    className="mt-1 w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm text-white outline-none transition-all focus:border-white/30 resize-none"
                  />
                  <p className="mt-1 text-[9px] text-white/30">
                    {editForm.bio.length}/500
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase transition-all hover:border-white/30 hover:bg-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 rounded-lg border border-white/25 bg-white text-black px-4 py-2 text-[10px] font-semibold uppercase transition-all hover:bg-white/90 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Name & bio - View Mode */}
            {!isEditing && (
              <div className="min-w-0 flex-1 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">
                    {profile.display_name}
                  </h1>
                  <span className="rounded-full border border-white/20 bg-white/[0.05] px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] text-white/60">
                    {profile.role}
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-white/30">@{profile.username}</p>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
                  {profile.bio ||
                    "No bio yet. Click Edit Profile to add one."}
                </p>
              </div>
            )}
          </div>

          {/* XP bar */}
          <div className="mt-8 max-w-md">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[2px] text-white/30">
              <span>Level {level} · Wanderer</span>
              <span className="text-white/50">{xpPercent}% to Level {level + 1}</span>
            </div>
            <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="xp-fill h-full rounded-full bg-white/60"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Avatar picker (presets only — no uploads) */}
          {showAvatarPicker && (
            <div className="mt-8 rounded-[20px] border border-white/[0.1] bg-[#080808] p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[3px] text-white/30">
                  Choose Your Avatar
                </p>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-[10px] uppercase tracking-[2px] text-white/30 transition-colors hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-12">
                {avatarPresets.map((avatar) => {
                  const isSelected = avatar.id === selectedAvatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        setShowAvatarPicker(false);
                      }}
                      className={`flex aspect-square items-center justify-center rounded-[16px] text-2xl transition-all duration-300 ${
                        avatar.tone
                      } ${
                        isSelected
                          ? "scale-[1.06] ring-2 ring-white/80 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                          : "hover:scale-105 hover:ring-2 hover:ring-white/30"
                      }`}
                    >
                      {avatar.icon}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] text-white/25">
                More avatar frames and presets unlock as you level up.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {defaultStats.map((stat, index) => {
            let displayValue = stat.value;
            if (stat.label === "Followers") displayValue = String(followerCount);
            if (stat.label === "Following") displayValue = String(followingCount);

            return (
              <ScrollReveal key={stat.label} delay={index * 50}>
                <div className="rounded-[18px] border border-white/[0.1] bg-[#080808] px-4 py-6 text-center transition-all duration-500 hover:-translate-y-0.5 hover:border-white/[0.2]">
                  <p className="stat-glow text-xl font-black text-white md:text-2xl">
                    {displayValue}
                  </p>
                  <p className="mt-1.5 text-[9px] uppercase tracking-[2px] text-white/30">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          TABS
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 md:px-10">
        <div className="flex gap-8 border-b border-white/[0.08]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-[11px] font-medium uppercase tracking-[2px] transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {tab}
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

      {/* =========================================================
          TAB CONTENT
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 py-16 md:px-10 md:py-20">
        {activeTab === "Overview" && (
          <div className="space-y-16">
            <ScrollReveal>
              <div className="mb-8 flex items-end justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                    ACHIEVEMENTS
                  </p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                    Badges
                  </h3>
                </div>
                <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
                  1 / {badges.length} UNLOCKED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                {badges.map((badge) => (
                  <div
                    key={badge.name}
                    className={`group/badge relative flex flex-col items-center gap-2 rounded-[18px] border p-4 text-center transition-all duration-500 ${
                      badge.unlocked
                        ? "border-white/[0.2] bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,255,255,0.08)]"
                        : "border-white/[0.06] bg-white/[0.015] opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-[1px] text-white/70">
                      {badge.name}
                    </span>

                    <span className="pointer-events-none absolute -bottom-2 left-1/2 z-20 w-max max-w-[140px] -translate-x-1/2 translate-y-full rounded-[10px] border border-white/10 bg-black px-3 py-2 text-[10px] text-white/60 opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover/badge:opacity-100">
                      {badge.desc}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="mb-8 border-b border-white/[0.08] pb-5">
                <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                  ACTIVITY
                </p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                  Recent Activity
                </h3>
              </div>

              <div className="rounded-[20px] border border-dashed border-white/[0.12] bg-[#070707] px-8 py-16 text-center">
                <span className="text-3xl">🌱</span>
                <p className="mt-4 text-sm text-white/30">
                  Your activity will appear here once you start creating.
                </p>
              </div>
            </ScrollReveal>
          </div>
        )}

        {activeTab === "Projects" && (
          <ScrollReveal>
            <div className="mb-8 border-b border-white/[0.08] pb-5">
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                PORTFOLIO
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                Your Projects
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex aspect-video items-center justify-center rounded-[20px] border border-dashed border-white/[0.12] bg-[#070707] text-white/20"
                >
                  <p className="text-sm">No projects yet</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        {activeTab === "Activity" && (
          <ScrollReveal>
            <div className="mb-8 border-b border-white/[0.08] pb-5">
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                TIMELINE
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                Recent Activity
              </h3>
            </div>

            <div className="rounded-[20px] border border-dashed border-white/[0.12] bg-[#070707] px-8 py-16 text-center">
              <span className="text-3xl">📡</span>
              <p className="mt-4 text-sm text-white/30">No activity yet.</p>
            </div>
          </ScrollReveal>
        )}

        {activeTab === "Saved" && (
          <ScrollReveal>
            <div className="mb-8 border-b border-white/[0.08] pb-5">
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                SAVED
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                Bookmarks & Favorites
              </h3>
            </div>

            <div className="rounded-[20px] border border-dashed border-white/[0.12] bg-[#070707] px-8 py-16 text-center">
              <span className="text-3xl">🔖</span>
              <p className="mt-4 text-sm text-white/30">
                Save projects and content you love for quick access.
              </p>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================== */}

      <section className="px-6 pb-10 md:px-10">
        <ScrollReveal>
          <div className="group/cta relative mx-auto flex min-h-[300px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center transition-all duration-700 hover:border-white/[0.18]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_60%)] transition-transform duration-[1500ms] group-hover/cta:scale-125" />

            <div className="relative z-10 px-6">
              <p className="text-[10px] font-medium uppercase tracking-[5px] text-white/30">
                QUICK ACTIONS
              </p>

              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                Join the community.
              </h3>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">
                Share your work, connect with fellow creators, and start building your presence.
              </p>

              <div className="mt-8 flex gap-4 flex-wrap justify-center">
                <Link
                  href="/forum"
                  className="inline-flex h-11 items-center rounded-full border border-white/25 bg-white/[0.05] px-6 text-[10px] font-semibold tracking-[2px] text-white/80 transition-all hover:bg-white/[0.12]"
                >
                  VISIT FORUM
                </Link>
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 cursor-not-allowed items-center rounded-full border border-white/25 px-6 text-[10px] font-semibold tracking-[2px] text-white/40 opacity-60"
                >
                  CREATE PROJECT — SOON
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <style>{`
        @keyframes stat-glow-pulse {
          0%, 100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
          50% { text-shadow: 0 0 18px rgba(255,255,255,0.35); }
        }

        .stat-glow {
          animation: stat-glow-pulse 4s ease-in-out infinite;
        }

        @keyframes xp-shimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
          100% { filter: brightness(1); }
        }

        .xp-fill {
          animation: xp-shimmer 2.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .stat-glow,
          .xp-fill {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
