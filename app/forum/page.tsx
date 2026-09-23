"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { CreateThreadModal } from "@/components/forum/create-thread-modal";
import { useAuth } from "@/lib/auth/use-auth";
import { getForumCategories } from "@/lib/actions/forum";
import type { Database } from "@/types/database";

type ForumCategory = Database["public"]["Tables"]["forum_categories"]["Row"];

const stats = [
  { label: "Threads", value: "824" },
  { label: "Replies", value: "4,555" },
  { label: "Members", value: "1,290" },
  { label: "Online Now", value: "37" },
];

const staticCategories = [
  { icon: "👋", name: "General", description: "Welcome, introductions, off-topic chatter.", threads: "142", replies: "890" },
  { icon: "🛠️", name: "Projects", description: "Discuss and showcase creative projects.", threads: "216", replies: "1,204" },
  { icon: "🌍", name: "Worlds", description: "Share worldbuilding ideas and concepts.", threads: "98", replies: "540" },
  { icon: "✍️", name: "Stories", description: "Creative writing and narrative discussions.", threads: "174", replies: "932" },
  { icon: "🎭", name: "Characters", description: "Character design and development.", threads: "133", replies: "701" },
  { icon: "🔍", name: "Theory", description: "Deep analysis and theoretical discussions.", threads: "61", replies: "288" },
];

const filters = ["Latest", "Most Active", "Unanswered"];

const trendingTags = [
  "#worldbuilding",
  "#characterdesign",
  "#feedback",
  "#storytelling",
  "#assets",
  "#lore",
];

const threads = [
  {
    title: "Tips for Starting Your First Project",
    author: "Creator Pro",
    category: "Projects",
    replies: 24,
    views: 156,
    time: "2h ago",
    hot: true,
  },
  {
    title: "Best Practices for World Building",
    author: "Lore Master",
    category: "Worlds",
    replies: 18,
    views: 203,
    time: "5h ago",
    hot: false,
  },
  {
    title: "Character Design Techniques That Actually Work",
    author: "Artist Elite",
    category: "Characters",
    replies: 31,
    views: 289,
    time: "1d ago",
    hot: true,
  },
  {
    title: "How Do You Handle Plot Pacing?",
    author: "Story Weaver",
    category: "Stories",
    replies: 12,
    views: 98,
    time: "1d ago",
    hot: false,
  },
  {
    title: "What Are You Playing This Week?",
    author: "Casual Corner",
    category: "General",
    replies: 9,
    views: 64,
    time: "2d ago",
    hot: false,
  },
];

const avatarPalette = [
  "bg-white/[0.14] text-white/80",
  "bg-white/[0.1] text-white/70",
  "bg-white/[0.18] text-white/90",
  "bg-white/[0.08] text-white/60",
  "bg-white/[0.12] text-white/75",
];

export default function ForumPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("Latest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories on mount
  useEffect(() => {
    async function load() {
      const cats = await getForumCategories();
      setCategories(cats);
      setLoadingCategories(false);
    }
    load();
  }, []);

  function handleOpenCreateModal() {
    if (!user) {
      redirect("/auth/login");
    }
    setIsCreateModalOpen(true);
  }

  return (
    <>
      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
      />
      <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
        <div
          className="
            hero-frame group relative mx-auto flex
            min-h-[460px] w-full max-w-[1760px]
            flex-col items-center justify-center
            overflow-hidden rounded-[32px]
            border border-white/[0.12]
            bg-[#030303]
            transition-[border-color,box-shadow]
            duration-1000
            hover:border-white/[0.2]
            hover:shadow-[0_25px_100px_rgba(0,0,0,0.55)]
          "
        >
          <ParallaxField />
          <StarField />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-[130px] transition-all duration-[1800ms] ease-out group-hover:scale-[1.25] group-hover:bg-white/[0.05]" />

          <div className="pointer-events-none absolute left-[7%] right-[7%] top-1/2 h-px bg-white/[0.035] transition-all duration-[1200ms] group-hover:left-[4%] group-hover:right-[4%] group-hover:bg-white/[0.07]" />

          <div className="pointer-events-none absolute left-7 top-7 h-7 w-7 border-l border-t border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
          <div className="pointer-events-none absolute right-7 top-7 h-7 w-7 border-r border-t border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
          <div className="pointer-events-none absolute bottom-7 left-7 h-7 w-7 border-b border-l border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
          <div className="pointer-events-none absolute bottom-7 right-7 h-7 w-7 border-b border-r border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />

          <div
            className="
              relative z-10 flex flex-col items-center px-6 text-center
              transition-transform duration-[1200ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:-translate-y-1
            "
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
              <p className="text-[10px] font-medium tracking-[6px] text-white/35 transition-all duration-1000 group-hover:tracking-[8px] group-hover:text-white/55 md:text-[12px]">
                COMMUNITY
              </p>
              <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
            </div>

            <h1 className="forum-title relative z-10 mt-5 text-[48px] font-black leading-none text-white sm:text-[60px] md:text-[76px] lg:text-[86px]">
              FORUM
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/35 md:text-base">
              Connect with creators. Share ideas, get feedback, and build
              relationships with the community. Foster collaboration and
              growth.
            </p>

            {/* Live stats strip */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span className="stat-glow text-2xl font-black tracking-[-0.02em] text-white md:text-3xl">
                    {stat.value}
                  </span>
                  <span className="mt-1 text-[9px] uppercase tracking-[3px] text-white/30">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 py-20 md:px-10 md:py-28">
        <ScrollReveal>
          <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                DISCUSSION TOPICS
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                Categories
              </h3>
            </div>

            <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
              {String(categories.length).padStart(2, "0")} CATEGORIES
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {staticCategories.map((cat, index) => (
              <ScrollReveal key={cat.name} delay={index * 70}>
                <article className="group/cat relative overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#080808] p-7 transition-all duration-700 hover:-translate-y-1 hover:border-white/[0.23] hover:shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
                  <div className="absolute inset-3 rounded-[18px] border border-white/[0.035] transition-all duration-700 group-hover/cat:border-white/[0.08]" />

                  <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/[0.02] blur-[40px] transition-all duration-700 group-hover/cat:scale-150 group-hover/cat:bg-white/[0.04]" />

                  <div className="relative z-10 flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.1] bg-white/[0.03] text-2xl transition-transform duration-500 group-hover/cat:scale-110">
                        {cat.icon}
                      </span>

                      <div>
                        <h4 className="text-[13px] font-semibold uppercase tracking-[2px] text-white/85 transition-colors duration-500 group-hover/cat:text-white">
                          {cat.name}
                        </h4>
                        <p className="mt-2 max-w-[240px] text-sm leading-6 text-white/30 transition-colors duration-500 group-hover/cat:text-white/50">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold text-white/70">
                        {cat.threads}
                      </p>
                      <p className="text-[9px] uppercase tracking-[2px] text-white/25">
                        threads
                      </p>
                      <p className="mt-2 text-[13px] font-semibold text-white/70">
                        {cat.replies}
                      </p>
                      <p className="text-[9px] uppercase tracking-[2px] text-white/25">
                        replies
                      </p>
                    </div>
                  </div>

                  <div className="media-shine pointer-events-none absolute -left-[60%] top-0 h-full w-[45%] skew-x-[-20deg] bg-white/[0.03]" />
                </article>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          RECENT DISCUSSIONS
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 md:px-10 md:pb-40">
        <ScrollReveal>
          <div className="mb-8 flex flex-col gap-6 border-b border-white/[0.08] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                ACTIVITY
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                Latest Discussions
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`
                      rounded-full border px-4 py-2
                      text-[10px] font-medium uppercase tracking-[2px]
                      transition-all duration-300
                      ${
                        isActive
                          ? "border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          : "border-white/[0.12] bg-white/[0.02] text-white/40 hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.18)]"
                      }
                    `}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trending tags */}
          <div className="mb-10 flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-[9px] uppercase tracking-[3px] text-white/20">
              Trending
            </span>
            {trendingTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[10px] text-white/35 transition-colors duration-300 hover:border-white/20 hover:text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Thread list */}
          <div className="space-y-3">
            {threads.map((thread, index) => (
              <ScrollReveal key={thread.title} delay={index * 60}>
                <article className="group/thread relative flex items-center gap-5 overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#070707] px-5 py-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/[0.2] hover:bg-[#0a0a0a] hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] md:px-7">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      avatarPalette[index % avatarPalette.length]
                    }`}
                  >
                    {thread.author.charAt(0)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="truncate text-[13px] font-semibold text-white/80 transition-colors duration-300 group-hover/thread:text-white">
                        {thread.title}
                      </h4>

                      {thread.hot && (
                        <span className="shrink-0 rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[1.5px] text-white/60">
                          Hot
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-[11px] text-white/25">
                      by <span className="text-white/40">{thread.author}</span>
                      {"  ·  "}
                      <span className="text-white/30">{thread.category}</span>
                      {"  ·  "}
                      {thread.time}
                    </p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-6 text-right sm:flex">
                    <div>
                      <p className="text-[13px] font-semibold text-white/60">
                        {thread.replies}
                      </p>
                      <p className="text-[9px] uppercase tracking-[2px] text-white/20">
                        replies
                      </p>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white/60">
                        {thread.views}
                      </p>
                      <p className="text-[9px] uppercase tracking-[2px] text-white/20">
                        views
                      </p>
                    </div>
                  </div>

                  <span className="thread-arrow shrink-0 text-white/15 transition-all duration-300 group-hover/thread:translate-x-1 group-hover/thread:text-white/50">
                    →
                  </span>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}

      <section className="px-6 pb-10 md:px-10">
        <ScrollReveal>
          <div className="group/cta relative mx-auto flex min-h-[400px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center transition-all duration-700 hover:border-white/[0.18]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_60%)] transition-transform duration-[1500ms] group-hover/cta:scale-125" />

            <div className="relative z-10 px-6">
              <p className="text-[10px] font-medium uppercase tracking-[5px] text-white/30">
                YOUR VOICE MATTERS
              </p>

              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                Join the conversation.
              </h3>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">
                Start a discussion or reply to ongoing threads. Community
                engagement is opening soon.
              </p>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="
                  mt-8 inline-flex h-11
                  items-center rounded-full
                  border border-white/25 bg-white text-black
                  px-7
                  text-[10px] font-semibold
                  tracking-[3px]
                  transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
                "
              >
                {user ? "START A THREAD" : "SIGN IN TO POST"}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <style>{`
        .forum-title {
          transition:
            letter-spacing 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            text-shadow 1100ms ease;
        }

        .hero-frame:hover .forum-title {
          letter-spacing: 4px;
          transform: scale(1.015);
          text-shadow:
            0 0 22px rgba(255,255,255,0.85),
            0 0 65px rgba(255,255,255,0.3);
        }

        @keyframes stat-glow-pulse {
          0%, 100% {
            text-shadow: 0 0 0 rgba(255,255,255,0);
          }
          50% {
            text-shadow: 0 0 18px rgba(255,255,255,0.35);
          }
        }

        .stat-glow {
          animation: stat-glow-pulse 4s ease-in-out infinite;
        }

        @keyframes media-shine {
          0% { left: -60%; }
          45%, 100% { left: 130%; }
        }

        .group\\/cat:hover .media-shine {
          animation: media-shine 1.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .forum-title {
            transition: none;
          }
          .hero-frame:hover .forum-title {
            transform: none;
          }
          .stat-glow {
            animation: none;
          }
        }
      `}</style>
      </div>
    </>
  );
}
