"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { SplitText } from "@/components/fx/split-text";
import { CountUp } from "@/components/fx/count-up";
import { CardSkeleton, CreationCard, ProjectCard } from "@/components/projects/cards";
import { CreateButton } from "@/components/projects/create-button";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, type TranslationKey } from "@/lib/i18n/translate";
import { fetchCreations, fetchProjects, fetchProjectsStats, type ProjectSort } from "@/lib/projects/client";
import type { CreationKind, CreationSummary, ProjectSummary, ProjectsStats } from "@/lib/projects/types";

type Tab = "projects" | "worlds" | "lore" | "characters";
type StatusFilter = "all" | "in_progress" | "completed";

const TABS: { id: Tab; label: TranslationKey; stat: keyof ProjectsStats; kind?: CreationKind }[] = [
  { id: "projects", label: "projects.tab.projects", stat: "total" },
  { id: "worlds", label: "projects.tab.worlds", stat: "worlds", kind: "world" },
  { id: "lore", label: "projects.tab.lore", stat: "lores", kind: "lore" },
  { id: "characters", label: "projects.tab.characters", stat: "characters", kind: "character" },
];

const STATUSES: { id: StatusFilter; label: TranslationKey }[] = [
  { id: "all", label: "projects.filter.all" },
  { id: "in_progress", label: "projects.status.inProgress" },
  { id: "completed", label: "projects.status.completed" },
];

const SORTS: { id: ProjectSort; label: TranslationKey; projectsOnly?: boolean }[] = [
  { id: "new", label: "projects.sort.new" },
  { id: "top", label: "projects.sort.top" },
  { id: "active", label: "projects.sort.active", projectsOnly: true },
  { id: "updated", label: "projects.sort.updated" },
];

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ProjectsHub />
    </Suspense>
  );
}

function ProjectsHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, lang } = useI18n();

  const tabParam = searchParams.get("tab") as Tab | null;
  const tab: Tab = TABS.some((item) => item.id === tabParam) ? (tabParam as Tab) : "projects";
  const statusParam = searchParams.get("status") as StatusFilter | null;
  const status: StatusFilter = STATUSES.some((item) => item.id === statusParam) ? (statusParam as StatusFilter) : "all";
  const sortParam = searchParams.get("sort") as ProjectSort | null;
  const sort: ProjectSort =
    SORTS.some((item) => item.id === sortParam && (tab === "projects" || !item.projectsOnly)) ? (sortParam as ProjectSort) : "new";
  const query = searchParams.get("q") ?? "";
  const mine = searchParams.get("mine") === "1" && !!user;

  const [stats, setStats] = useState<ProjectsStats | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [creations, setCreations] = useState<CreationSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const listRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  const updateParams = useCallback(
    (patch: Record<string, string | null>, scroll = false) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      });
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      if (scroll) window.setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    fetchProjectsStats().then(setStats);
  }, []);

  useEffect(() => setSearchInput(query), [query]);

  useEffect(() => {
    if (searchInput === query) return;
    const timer = window.setTimeout(() => updateParams({ q: searchInput.trim() || null }), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, query, updateParams]);

  const load = useCallback(
    async (pageToLoad: number) => {
      const id = ++requestRef.current;
      if (pageToLoad === 0) setLoading(true);
      else setLoadingMore(true);

      const kind = TABS.find((item) => item.id === tab)?.kind;
      if (kind) {
        const result = await fetchCreations({
          kind,
          sort: sort === "active" ? "new" : (sort as "new" | "top" | "updated"),
          query,
          authorId: mine ? user?.id : undefined,
          page: pageToLoad,
          withFields: kind === "character",
        });
        if (id !== requestRef.current) return;
        setCreations((list) => (pageToLoad === 0 ? result.items : [...list, ...result.items]));
        setHasMore(result.hasMore);
      } else {
        const result = await fetchProjects({
          status,
          sort,
          query,
          memberId: mine ? user?.id : undefined,
          page: pageToLoad,
        });
        if (id !== requestRef.current) return;
        setProjects((list) => (pageToLoad === 0 ? result.items : [...list, ...result.items]));
        setHasMore(result.hasMore);
      }
      setPage(pageToLoad);
      setLoading(false);
      setLoadingMore(false);
    },
    [tab, status, sort, query, mine, user?.id],
  );

  useEffect(() => {
    void load(0);
  }, [load]);

  const heroStats: { label: TranslationKey; value: number }[] = [
    { label: "projects.stat.total", value: stats?.total ?? 0 },
    { label: "projects.stat.inProgress", value: stats?.in_progress ?? 0 },
    { label: "projects.stat.completed", value: stats?.completed ?? 0 },
    { label: "projects.stat.creators", value: stats?.creators ?? 0 },
  ];

  const isProjects = tab === "projects";
  const items = isProjects ? projects.length : creations.length;
  const activeTab = TABS.find((item) => item.id === tab)!;
  const hasFilters = !!query || status !== "all" || mine;

  return (
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
                {t("projects.eyebrow")}
              </p>
              <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
            </div>

            <h1 className="projects-title relative z-10 mt-5 text-[48px] font-black leading-none text-white sm:text-[60px] md:text-[76px] lg:text-[86px]">
              <SplitText text={t("nav.projects").toUpperCase()} />
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/35 md:text-base">{t("projects.heroText")}</p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="stat-glow text-2xl font-black tracking-[-0.02em] text-white md:text-3xl">
                    {stats ? <CountUp value={stat.value} /> : <span className="zx-skeleton inline-block h-7 w-10 rounded" />}
                  </span>
                  <span className="mt-1 text-[9px] uppercase tracking-[3px] text-white/30">{t(stat.label)}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <CreateButton up />
            </div>
          </div>
        </div>
      </section>

      {/* BROWSE */}
      <section ref={listRef} className="mx-auto w-full max-w-[1760px] scroll-mt-6 px-6 pt-20 md:px-10 md:pt-24">
        <ScrollReveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[5px] text-white/30">{t("projects.browseEyebrow")}</p>
              <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-5xl">
                {t("projects.browseTitle")}
              </h2>
            </div>

            <div className="relative w-full max-w-sm">
              <SearchIcon size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value.slice(0, 80))}
                placeholder={t(isProjects ? "projects.searchProjects" : "projects.searchCreations")}
                className="h-12 w-full rounded-full border border-white/[0.12] bg-white/[0.03] pl-11 pr-11 text-[13px] text-white outline-none transition-all placeholder:text-white/25 focus:border-white/35 focus:bg-white/[0.05]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label={t("common.clear")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
                >
                  <CloseIcon size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="relative flex gap-1 overflow-x-auto rounded-full border border-white/[0.1] bg-white/[0.02] p-1 sm:inline-flex">
            {TABS.map((item) => {
              const active = item.id === tab;
              const count = stats ? stats[item.stat] : null;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-sound="toggle"
                  onClick={() => updateParams({ tab: item.id === "projects" ? null : item.id, status: null, sort: null }, true)}
                  className={`flex h-11 shrink-0 items-center gap-2.5 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[2px] transition-all duration-500 ${
                    active
                      ? "bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.22)]"
                      : "text-white/45 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {t(item.label)}
                  {count !== null && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] tabular-nums ${active ? "bg-black/10" : "bg-white/[0.06] text-white/40"}`}>
                      {formatNumber(lang, count)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isProjects &&
              STATUSES.map((item) => {
                const active = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-sound="toggle"
                    onClick={() => updateParams({ status: item.id === "all" ? null : item.id })}
                    className={`rounded-full border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[2px] transition-all duration-300 ${
                      active
                        ? "border-white bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                        : "border-white/[0.12] bg-white/[0.02] text-white/40 hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    }`}
                  >
                    {t(item.label)}
                    {stats && item.id !== "all" && (
                      <span className="ml-2 opacity-60">{formatNumber(lang, item.id === "completed" ? stats.completed : stats.in_progress)}</span>
                    )}
                  </button>
                );
              })}

            {user && (
              <button
                type="button"
                data-sound="toggle"
                onClick={() => updateParams({ mine: mine ? null : "1" })}
                className={`rounded-full border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[2px] transition-all duration-300 ${
                  mine ? "border-white/60 bg-white/[0.1] text-white" : "border-white/[0.12] text-white/40 hover:border-white/40 hover:text-white"
                }`}
              >
                {t(isProjects ? "projects.filter.mineProjects" : "projects.filter.mine")}
              </button>
            )}

            <span className="flex-1" />

            <div className="flex items-center gap-1 rounded-full border border-white/[0.08] p-1">
              {SORTS.filter((item) => isProjects || !item.projectsOnly).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-sound="toggle"
                  onClick={() => updateParams({ sort: item.id === "new" ? null : item.id })}
                  className={`h-8 rounded-full px-3.5 text-[10px] font-semibold uppercase tracking-[1.5px] transition-all duration-300 ${
                    sort === item.id ? "bg-white/[0.12] text-white" : "text-white/35 hover:text-white/80"
                  }`}
                >
                  {t(item.label)}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* GRID */}
      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 pt-12 md:px-10 md:pb-40 md:pt-14">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("projects.workspacesEyebrow")}</p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{t(activeTab.label)}</h3>
          </div>
          <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
            {String(items).padStart(2, "0")} {t("projects.shown")}
          </span>
        </div>

        {loading ? (
          <div className={`grid gap-x-6 gap-y-16 md:gap-x-8 ${tab === "characters" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
            {Array.from({ length: tab === "characters" ? 4 : 3 }).map((_, index) => (
              <CardSkeleton key={index} tall={tab === "characters"} />
            ))}
          </div>
        ) : items === 0 ? (
          <div className="zx-rise-in flex flex-col items-center rounded-[28px] border border-dashed border-white/[0.1] px-6 py-20 text-center">
            <p className="text-[10px] uppercase tracking-[4px] text-white/25">{t(hasFilters ? "projects.emptyFiltered" : "projects.emptyEyebrow")}</p>
            <h4 className="mt-4 max-w-md text-2xl font-semibold tracking-[-0.02em] text-white">
              {t(isProjects ? "projects.emptyProjects" : "projects.emptyCreations")}
            </h4>
            <p className="mt-3 max-w-md text-sm text-white/35">{t("projects.emptyText")}</p>
            <div className="mt-8">
              <CreateButton kind={activeTab.kind ?? "project"} />
            </div>
          </div>
        ) : (
          <div className={`grid gap-x-6 gap-y-16 md:gap-x-8 ${tab === "characters" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
            {isProjects
              ? projects.map((project, index) => (
                  <ScrollReveal key={project.id} delay={(index % 3) * 90}>
                    <ProjectCard project={project} index={index} />
                  </ScrollReveal>
                ))
              : creations.map((item, index) => (
                  <ScrollReveal key={item.id} delay={(index % 4) * 80}>
                    <CreationCard item={item} />
                  </ScrollReveal>
                ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-16 flex justify-center">
            <button
              type="button"
              onClick={() => void load(page + 1)}
              disabled={loadingMore}
              className="inline-flex h-12 items-center rounded-full border border-white/20 px-8 text-[10px] font-semibold uppercase tracking-[3px] text-white/60 transition-all hover:border-white hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loadingMore ? t("common.loading") : t("projects.loadMore")}
            </button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-6 pb-10 md:px-10">
        <ScrollReveal>
          <div className="group/cta relative mx-auto flex min-h-[400px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center transition-all duration-700 hover:border-white/[0.18]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_60%)] transition-transform duration-[1500ms] group-hover/cta:scale-125" />
            <div className="relative z-10 px-6">
              <p className="text-[10px] font-medium uppercase tracking-[5px] text-white/30">{t("projects.ctaEyebrow")}</p>
              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">{t("projects.ctaTitle")}</h3>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">{t("projects.ctaText")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/create/project"
                  data-magnetic="0.2"
                  className="inline-flex h-11 items-center rounded-full bg-white px-7 text-[10px] font-semibold tracking-[3px] text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  {t("projects.ctaButton")}
                </Link>
                <Link
                  href="/create/world"
                  className="inline-flex h-11 items-center rounded-full border border-white/25 px-7 text-[10px] font-semibold tracking-[3px] text-white/60 transition-all hover:border-white hover:text-white"
                >
                  {t("projects.ctaWorld")}
                </Link>
              </div>
              <p className="mx-auto mt-6 max-w-md text-[11px] text-white/25">{t("projects.noLinksNotice")}</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <style>{`
        .projects-title {
          transition: letter-spacing 1100ms cubic-bezier(0.16, 1, 0.3, 1), transform 1100ms cubic-bezier(0.16, 1, 0.3, 1), text-shadow 1100ms ease;
        }
        .hero-frame:hover .projects-title {
          letter-spacing: 4px;
          transform: scale(1.015);
          text-shadow: 0 0 22px rgba(255,255,255,0.85), 0 0 65px rgba(255,255,255,0.3);
        }
        @keyframes stat-glow-pulse {
          0%, 100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
          50% { text-shadow: 0 0 18px rgba(255,255,255,0.35); }
        }
        .stat-glow { animation: stat-glow-pulse 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .projects-title { transition: none; }
          .hero-frame:hover .projects-title { transform: none; }
          .stat-glow { animation: none; }
        }
      `}</style>
    </div>
  );
}
