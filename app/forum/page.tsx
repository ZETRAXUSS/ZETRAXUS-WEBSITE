"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { SplitText } from "@/components/fx/split-text";
import { CountUp } from "@/components/fx/count-up";
import { CreateThreadModal } from "@/components/forum/create-thread-modal";
import { ThreadCard, ThreadCardSkeleton } from "@/components/forum/thread-card";
import { CloseIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/translate";
import {
  fetchBookmarkedIds,
  fetchCategories,
  fetchForumStats,
  fetchThreads,
  setBookmark,
} from "@/lib/forum/client";
import { useOnlineCount } from "@/lib/forum/use-online-count";
import type { ForumCategory, ForumStats, ThreadSort, ThreadSummary } from "@/lib/forum/types";
import type { TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";

const SORTS: { id: ThreadSort; label: TranslationKey }[] = [
  { id: "latest", label: "forum.sort.latest" },
  { id: "new", label: "forum.sort.new" },
  { id: "active", label: "forum.sort.active" },
  { id: "top", label: "forum.sort.top" },
  { id: "unanswered", label: "forum.sort.unanswered" },
];

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ForumView />
    </Suspense>
  );
}

function ForumView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();
  const online = useOnlineCount(user?.id);

  const categorySlug = searchParams.get("category");
  const author = searchParams.get("author");
  const query = searchParams.get("q") ?? "";
  const view = searchParams.get("view");
  const sortParam = searchParams.get("sort") as ThreadSort | null;
  const sort: ThreadSort = SORTS.some((s) => s.id === sortParam) ? (sortParam as ThreadSort) : "latest";
  const wantsNew = searchParams.get("new") === "1";
  const savedView = view === "saved";

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(query);
  const [createOpen, setCreateOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug) ?? null,
    [categories, categorySlug],
  );

  const catName = (category: ForumCategory | null) =>
    category ? (lang === "tr" && category.name_tr ? category.name_tr : category.name) : "";

  // URL helpers ---------------------------------------------------------
  const updateParams = useCallback(
    (patch: Record<string, string | null>, scrollToList = false) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      });
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      if (scrollToList) {
        window.setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }
    },
    [router, pathname, searchParams],
  );

  // Static data ---------------------------------------------------------
  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchForumStats().then(setStats);
  }, []);

  // Open composer from ?new=1 (header "Create → Discussion")
  useEffect(() => {
    if (!wantsNew || authLoading) return;
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent("/forum?new=1")}`);
      return;
    }
    setCreateOpen(true);
    updateParams({ new: null });
  }, [wantsNew, user, authLoading, router, updateParams]);

  // Keep the search box in sync with the URL
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Debounce typing → URL
  useEffect(() => {
    if (searchInput === query) return;
    const timer = window.setTimeout(() => updateParams({ q: searchInput.trim() || null }), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, query, updateParams]);

  // Load threads whenever filters change -----------------------------------
  const load = useCallback(
    async (pageToLoad: number) => {
      if (categorySlug && !categories.length) return; // wait for category ids
      if (savedView && !user) {
        setThreads([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const id = ++requestRef.current;
      if (pageToLoad === 0) setLoading(true);
      else setLoadingMore(true);

      const result = await fetchThreads({
        sort,
        categoryId: activeCategory?.id ?? null,
        authorUsername: author,
        query,
        savedBy: savedView ? user?.id : null,
        page: pageToLoad,
      });

      if (id !== requestRef.current) return;

      setThreads((current) => (pageToLoad === 0 ? result.items : [...current, ...result.items]));
      setHasMore(result.hasMore);
      setPage(pageToLoad);
      setLoading(false);
      setLoadingMore(false);

      if (user) {
        const ids = await fetchBookmarkedIds(user.id, result.items.map((item) => item.id));
        setSavedIds((current) => {
          const next = new Set(pageToLoad === 0 ? [] : current);
          ids.forEach((value) => next.add(value));
          return next;
        });
      }
    },
    [sort, activeCategory, categorySlug, categories.length, author, query, savedView, user],
  );

  useEffect(() => {
    if (authLoading && savedView) return;
    void load(0);
  }, [load, authLoading, savedView]);

  // Infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !loadingMore) void load(page + 1);
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, load, page]);

  const toggleSave = async (thread: ThreadSummary) => {
    if (!user) {
      router.push("/auth/login?next=/forum");
      return;
    }
    const saved = savedIds.has(thread.id);
    setSavedIds((current) => {
      const next = new Set(current);
      if (saved) next.delete(thread.id);
      else next.add(thread.id);
      return next;
    });
    if (savedView && saved) setThreads((list) => list.filter((item) => item.id !== thread.id));
    await setBookmark(thread.id, user.id, !saved);
  };

  const openComposer = () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent("/forum?new=1")}`);
      return;
    }
    setCreateOpen(true);
  };

  const heading = savedView
    ? t("forum.savedTitle")
    : author
      ? t("forum.byAuthor", { name: author })
      : query
        ? t("forum.resultsFor", { query })
        : activeCategory
          ? catName(activeCategory)
          : t("forum.latestTitle");

  const statCards = [
    { label: t("forum.stats.threads"), value: stats?.threads ?? 0 },
    { label: t("forum.stats.replies"), value: stats?.replies ?? 0 },
    { label: t("forum.stats.members"), value: stats?.members ?? 0 },
    { label: t("forum.stats.online"), value: online ?? 0, live: true },
  ];

  const hasFilters = !!(activeCategory || author || query || savedView || sort !== "latest");

  return (
    <>
      <CreateThreadModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        defaultCategoryId={activeCategory?.id}
      />

      <div className="min-h-screen overflow-hidden bg-black text-white">
        {/* HERO */}
        <section className="px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
          <div className="hero-frame group relative mx-auto flex min-h-[460px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[32px] border border-white/[0.12] bg-[#030303] transition-[border-color,box-shadow] duration-1000 hover:border-white/[0.2] hover:shadow-[0_25px_100px_rgba(0,0,0,0.55)]">
            <ParallaxField />
            <StarField />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.05] opacity-60 blur-[130px] transition-[transform,opacity] duration-[1800ms] ease-out will-change-transform group-hover:scale-[1.25] group-hover:opacity-100" />
            <div className="pointer-events-none absolute left-[7%] right-[7%] top-1/2 h-px bg-white/[0.035] transition-all duration-[1200ms] group-hover:left-[4%] group-hover:right-[4%] group-hover:bg-white/[0.07]" />

            <div className="pointer-events-none absolute left-7 top-7 h-7 w-7 border-l border-t border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
            <div className="pointer-events-none absolute right-7 top-7 h-7 w-7 border-r border-t border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
            <div className="pointer-events-none absolute bottom-7 left-7 h-7 w-7 border-b border-l border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />
            <div className="pointer-events-none absolute bottom-7 right-7 h-7 w-7 border-b border-r border-white/[0.08] transition-all duration-700 ease-out group-hover:h-11 group-hover:w-11 group-hover:border-white/[0.2]" />

            <div className="relative z-10 flex flex-col items-center px-6 text-center transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
                <p className="text-[10px] font-medium tracking-[6px] text-white/35 transition-all duration-1000 group-hover:tracking-[8px] group-hover:text-white/55 md:text-[12px]">
                  {t("forum.eyebrow")}
                </p>
                <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
              </div>

              <h1 className="forum-title relative z-10 mt-5 text-[48px] font-black leading-none text-white sm:text-[60px] md:text-[76px] lg:text-[86px]">
                <SplitText text={t("nav.forum").toUpperCase()} />
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/35 md:text-base">{t("forum.heroText")}</p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {statCards.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <span className="stat-glow flex items-center gap-2 text-2xl font-black tracking-[-0.02em] text-white md:text-3xl">
                      {stat.live && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                      )}
                      <CountUp value={stat.value} format={(value) => formatNumber(lang, value)} />
                    </span>
                    <span className="mt-1 text-[9px] uppercase tracking-[3px] text-white/30">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto w-full max-w-[1760px] px-6 py-20 md:px-10 md:py-28">
          <ScrollReveal>
            <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("forum.topicsEyebrow")}</p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{t("forum.categories")}</h3>
              </div>
              <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
                {String(categories.length).padStart(2, "0")} {t("forum.categoriesCount")}
              </span>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.length === 0 &&
              [0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="zx-skeleton block h-[150px] rounded-[24px]" />)}

            {categories.map((category, index) => {
              const counts = stats?.categories.find((item) => item.id === category.id);
              const active = activeCategory?.id === category.id;
              return (
                <ScrollReveal key={category.id} delay={index * 70}>
                  <button
                    type="button"
                    data-spotlight
                    onClick={() => updateParams({ category: active ? null : category.slug }, true)}
                    aria-pressed={active}
                    className={`group/cat relative w-full overflow-hidden rounded-[24px] border p-7 text-left transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(0,0,0,0.45)] ${
                      active
                        ? "border-white/50 bg-[#0d0d0d] shadow-[0_0_50px_rgba(255,255,255,0.08)]"
                        : "border-white/[0.1] bg-[#080808] hover:border-white/[0.23]"
                    }`}
                  >
                    <div className="absolute inset-3 rounded-[18px] border border-white/[0.035] transition-all duration-700 group-hover/cat:border-white/[0.08]" />
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/[0.04] opacity-50 blur-[40px] transition-[transform,opacity] duration-700 group-hover/cat:scale-150 group-hover/cat:opacity-100" />

                    <div className="relative z-[3] flex items-start justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border font-mono text-[13px] font-medium tracking-[1px] transition-all duration-500 group-hover/cat:scale-105 ${
                            active
                              ? "border-white bg-white text-black shadow-[0_0_22px_rgba(255,255,255,0.35)]"
                              : "border-white/[0.12] bg-white/[0.03] text-white/60 group-hover/cat:border-white/30 group-hover/cat:text-white"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="text-[13px] font-semibold uppercase tracking-[2px] text-white/85 transition-all duration-500 group-hover/cat:tracking-[2.5px] group-hover/cat:text-white">
                            {catName(category)}
                          </h4>
                          <p className="mt-2 max-w-[260px] text-sm leading-6 text-white/30 transition-colors duration-500 group-hover/cat:text-white/50">
                            {lang === "tr" && category.description_tr ? category.description_tr : category.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-semibold text-white/70">{formatNumber(lang, counts?.threads ?? 0)}</p>
                        <p className="text-[9px] uppercase tracking-[2px] text-white/25">{t("forum.threads")}</p>
                        <p className="mt-2 text-[13px] font-semibold text-white/70">{formatNumber(lang, counts?.replies ?? 0)}</p>
                        <p className="text-[9px] uppercase tracking-[2px] text-white/25">{t("forum.replies")}</p>
                      </div>
                    </div>

                    <div className="media-shine pointer-events-none absolute -left-[60%] top-0 h-full w-[45%] skew-x-[-20deg] bg-white/[0.03]" />
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* DISCUSSIONS */}
        <section ref={listRef} id="discussions" className="mx-auto w-full max-w-[1760px] scroll-mt-8 px-6 pb-32 md:px-10 md:pb-40">
          <div className="mb-8 flex flex-col gap-6 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("forum.activityEyebrow")}</p>
              <h3 key={heading} className="zx-rise-in mt-3 truncate text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                {heading}
              </h3>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* search */}
              <div className="group/search relative flex h-11 items-center rounded-full border border-white/[0.12] bg-white/[0.025] transition-all duration-500 focus-within:border-white/35 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_30px_rgba(255,255,255,0.06)] sm:w-[300px]">
                <SearchIcon size={15} className="ml-4 shrink-0 text-white/35 transition-colors group-focus-within/search:text-white" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t("forum.searchPlaceholder")}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-white/25"
                  aria-label={t("forum.searchPlaceholder")}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    aria-label={t("common.clear")}
                    className="mr-2 flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
                  >
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={openComposer}
                data-magnetic="0.18"
                className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-6 text-[10px] font-semibold uppercase tracking-[2px] text-black transition-all hover:shadow-[0_0_32px_rgba(255,255,255,0.3)]"
              >
                <span className="pointer-events-none absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-black/10 transition-all duration-700 group-hover:left-[150%]" />
                <PlusIcon size={13} className="relative transition-transform duration-500 group-hover:rotate-90" />
                <span className="relative">{t("forum.newThread")}</span>
              </button>
            </div>
          </div>

          {/* sort + filters */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {SORTS.map((option) => {
                const active = sort === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateParams({ sort: option.id === "latest" ? null : option.id })}
                    data-sound="toggle"
                    className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[2px] transition-all duration-300 ${
                      active
                        ? "border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "border-white/[0.12] bg-white/[0.02] text-white/40 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
              {user && (
                <button
                  type="button"
                  onClick={() => updateParams({ view: savedView ? null : "saved" })}
                  data-sound="toggle"
                  className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[2px] transition-all duration-300 ${
                    savedView
                      ? "border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      : "border-white/[0.12] bg-white/[0.02] text-white/40 hover:border-white/50 hover:text-white"
                  }`}
                >
                  {t("nav.saved")}
                </button>
              )}
            </div>

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {activeCategory && (
                  <FilterChip label={catName(activeCategory)} onClear={() => updateParams({ category: null })} />
                )}
                {author && <FilterChip label={`@${author}`} onClear={() => updateParams({ author: null })} />}
                {query && <FilterChip label={`“${query}”`} onClear={() => updateParams({ q: null })} />}
                <button
                  type="button"
                  onClick={() => router.replace(pathname, { scroll: false })}
                  className="px-2 text-[10px] uppercase tracking-[2px] text-white/30 hover:text-white"
                >
                  {t("forum.clearFilters")}
                </button>
              </div>
            )}
          </div>

          {/* list */}
          <div className="space-y-3">
            {loading && [0, 1, 2, 3, 4].map((i) => <ThreadCardSkeleton key={i} />)}

            {!loading &&
              threads.map((thread, index) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  index={index % 15}
                  saved={savedIds.has(thread.id)}
                  onToggleSave={toggleSave}
                />
              ))}

            {!loading && threads.length === 0 && (
              <div className="zx-rise-in rounded-[24px] border border-dashed border-white/[0.12] bg-[#060606] px-8 py-20 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.12] font-mono text-[11px] tracking-[2px] text-white/35">
                  00
                </span>
                <h4 className="mt-6 text-lg font-semibold text-white/80">
                  {savedView
                    ? t("forum.emptySaved")
                    : hasFilters
                      ? t("forum.emptyFiltered")
                      : t("forum.emptyTitle")}
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/35">
                  {savedView ? t("forum.emptySavedDesc") : t("forum.emptyDesc")}
                </p>
                {!savedView && (
                  <button
                    type="button"
                    onClick={openComposer}
                    className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/75 hover:border-white hover:bg-white hover:text-black"
                  >
                    <PlusIcon size={12} />
                    {t("forum.startFirst")}
                  </button>
                )}
              </div>
            )}

            {loadingMore && [0, 1].map((i) => <ThreadCardSkeleton key={`more-${i}`} />)}
            <div ref={sentinelRef} className="h-4" />
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-10 md:px-10">
          <ScrollReveal>
            <div
              data-spotlight
              className="group/cta relative mx-auto flex min-h-[400px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center transition-all duration-700 hover:border-white/[0.18]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_60%)] transition-transform duration-[1500ms] group-hover/cta:scale-125" />

              <div className="relative z-[3] px-6">
                <p className="text-[10px] font-medium uppercase tracking-[5px] text-white/30">{t("forum.ctaEyebrow")}</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">{t("forum.ctaTitle")}</h3>
                <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">{t("forum.ctaText")}</p>
                <button
                  type="button"
                  onClick={openComposer}
                  data-magnetic="0.2"
                  className="mt-8 inline-flex h-11 items-center rounded-full border border-white/25 bg-white px-7 text-[10px] font-semibold tracking-[3px] text-black transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  {user ? t("forum.startThread") : t("forum.signInToPost")}
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
            text-shadow: 0 0 22px rgba(255,255,255,0.85), 0 0 65px rgba(255,255,255,0.3);
          }
          @keyframes stat-glow-pulse {
            0%, 100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
            50% { text-shadow: 0 0 18px rgba(255,255,255,0.35); }
          }
          .stat-glow { animation: stat-glow-pulse 4s ease-in-out infinite; }
          @keyframes media-shine {
            0% { left: -60%; }
            45%, 100% { left: 130%; }
          }
          .group\\/cat:hover .media-shine { animation: media-shine 1.4s ease-out; }
          @media (prefers-reduced-motion: reduce) {
            .forum-title { transition: none; }
            .hero-frame:hover .forum-title { transform: none; }
            .stat-glow { animation: none; }
          }
        `}</style>
      </div>
    </>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="zx-rise-in flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] py-1 pl-3 pr-1 text-[11px] text-white/80">
      {label}
      <button
        type="button"
        onClick={() => {
          onClear();
          playSound("close");
        }}
        data-sound="off"
        className="flex h-5 w-5 items-center justify-center rounded-full text-white/50 hover:bg-white/15 hover:text-white"
      >
        <CloseIcon size={10} />
      </button>
    </span>
  );
}
