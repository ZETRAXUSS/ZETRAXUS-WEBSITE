"use client";

import { useState } from "react";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { SplitText } from "@/components/fx/split-text";
import { CountUp } from "@/components/fx/count-up";
import { useT } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";

const stats: { label: TranslationKey; value: number }[] = [
  { label: "projects.stat.total", value: 312 },
  { label: "projects.stat.active", value: 184 },
  { label: "projects.stat.creators", value: 97 },
  { label: "projects.stat.completed", value: 58 },
];

const filters = ["All", "Active", "In Progress", "Worlds", "Stories", "Characters"];

const LABELS: Record<string, TranslationKey> = {
  All: "explore.cat.all",
  Active: "projects.status.active",
  "In Progress": "projects.status.inProgress",
  Worlds: "explore.cat.worlds",
  Stories: "explore.cat.stories",
  Characters: "explore.cat.characters",
};

const projects = [
  { number: "01", title: "Ethereal Worlds", creator: "Cosmic Creator", status: "Active", category: "Worlds", progress: 82 },
  { number: "02", title: "Character Chronicles", creator: "Art Master", status: "In Progress", category: "Characters", progress: 45 },
  { number: "03", title: "Narrative Depths", creator: "Story Writer", status: "Active", category: "Stories", progress: 68 },
  { number: "04", title: "Lore Archive", creator: "Lore Keeper", status: "Active", category: "Worlds", progress: 91 },
  { number: "05", title: "Project Nexus", creator: "Dev Creator", status: "In Progress", category: "Characters", progress: 33 },
  { number: "06", title: "World Foundation", creator: "Builder Pro", status: "Active", category: "Worlds", progress: 76 },
];

const avatarPalette = [
  "bg-white/[0.14] text-white/80",
  "bg-white/[0.1] text-white/70",
  "bg-white/[0.18] text-white/90",
  "bg-white/[0.08] text-white/60",
  "bg-white/[0.12] text-white/75",
  "bg-white/[0.16] text-white/85",
];

export default function ProjectsPage() {
  const t = useT();
  const [activeFilter, setActiveFilter] = useState("All");

  const visibleProjects = projects.filter((project) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Active" || activeFilter === "In Progress") {
      return project.status === activeFilter;
    }
    return project.category === activeFilter;
  });

  return (
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

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.05] opacity-60 blur-[130px] transition-[transform,opacity] duration-[1800ms] ease-out will-change-transform group-hover:scale-[1.25] group-hover:opacity-100" />

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
                {t("projects.eyebrow")}
              </p>
              <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
            </div>

            <h1 className="projects-title relative z-10 mt-5 text-[48px] font-black leading-none text-white sm:text-[60px] md:text-[76px] lg:text-[86px]">
              <SplitText text={t("nav.projects").toUpperCase()} />
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/35 md:text-base">
              {t("projects.heroText")}
            </p>

            {/* Live stats strip */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="stat-glow text-2xl font-black tracking-[-0.02em] text-white md:text-3xl">
                    <CountUp value={stat.value} />
                  </span>
                  <span className="mt-1 text-[9px] uppercase tracking-[3px] text-white/30">
                    {t(stat.label)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTERS
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pt-20 md:px-10 md:pt-28">
        <ScrollReveal>
          <div className="mb-10">
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[5px] text-white/30">
              {t("projects.browseEyebrow")}
            </p>
            <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-5xl">
              {t("projects.browseTitle")}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  data-sound="toggle"
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    rounded-full border px-5 py-2.5
                    text-[11px] font-medium uppercase tracking-[2px]
                    transition-all duration-300
                    ${
                      isActive
                        ? "border-white bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                        : "border-white/[0.12] bg-white/[0.02] text-white/40 hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    }
                  `}
                >
                  {t(LABELS[filter])}
                </button>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          PROJECTS GRID
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 pt-16 md:px-10 md:pb-40 md:pt-20">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[5px] text-white/25">
              {t("projects.workspacesEyebrow")}
            </p>
            <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
              {t("projects.activeTitle")}
            </h3>
          </div>

          <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
            {String(visibleProjects.length).padStart(2, "0")} {t("projects.shown")}
          </span>
        </div>

        <div className="grid gap-x-6 gap-y-16 md:grid-cols-3 md:gap-x-8">
          {visibleProjects.map((project, index) => (
            <ScrollReveal key={project.number} delay={index * 90}>
              <article className="group/media">
                <div
                  data-spotlight
                  className="
                    relative aspect-[4/3]
                    overflow-hidden rounded-[24px]
                    border border-white/[0.1]
                    bg-[#080808]
                    transition-all duration-700
                    group-hover/media:-translate-y-1
                    group-hover/media:border-white/[0.23]
                    group-hover/media:shadow-[0_20px_70px_rgba(0,0,0,0.45)]
                  "
                >
                  <div className="absolute inset-3 rounded-[18px] border border-white/[0.035] transition-all duration-700 group-hover/media:border-white/[0.08]" />

                  <div className="absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[55px] transition-all duration-700 group-hover/media:scale-150 group-hover/media:bg-white/[0.05]" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-[4px] text-white/15 transition-all duration-500 group-hover/media:tracking-[6px] group-hover/media:text-white/35">
                      {t(LABELS[project.category])}
                    </span>
                  </div>

                  <span className="absolute left-5 top-5 text-[10px] tracking-[3px] text-white/25">
                    {project.number}
                  </span>

                  <span
                    className={`absolute right-5 top-5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[1px] ${
                      project.status === "Active"
                        ? "border-white/20 bg-white/[0.06] text-white/80"
                        : "border-white/[0.12] bg-white/[0.02] text-white/40"
                    }`}
                  >
                    {t(LABELS[project.status])}
                  </span>

                  <span className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-white/10 transition-all duration-500 group-hover/media:h-6 group-hover/media:w-6 group-hover/media:border-white/30" />

                  <div className="media-shine pointer-events-none absolute -left-[60%] top-0 h-full w-[45%] skew-x-[-20deg] bg-white/[0.045]" />
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        avatarPalette[index % avatarPalette.length]
                      }`}
                    >
                      {project.creator.charAt(0)}
                    </span>

                    <div className="min-w-0">
                      <h4 className="truncate text-[12px] font-semibold tracking-[2px] text-white/75 transition-all duration-500 group-hover/media:text-white">
                        {project.title.toUpperCase()}
                      </h4>
                      <p className="text-[11px] text-white/25">
                        {t("common.by")} {project.creator}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-[2px] text-white/25">
                      <span>{t("projects.progress")}</span>
                      <span className="text-white/40">{project.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-white/40 transition-all duration-700 group-hover/media:bg-white/70"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {visibleProjects.length === 0 && (
          <p className="py-16 text-center text-sm text-white/25">
            {t("projects.empty")}
          </p>
        )}
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
                {t("projects.ctaEyebrow")}
              </p>

              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                {t("projects.ctaTitle")}
              </h3>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">
                {t("projects.ctaText")}
              </p>

              <button
                type="button"
                disabled
                className="
                  mt-8 inline-flex h-11
                  cursor-not-allowed items-center rounded-full
                  border border-white/25
                  px-7
                  text-[10px] font-semibold
                  tracking-[3px] text-white/40
                  opacity-60
                "
              >
                {t("projects.ctaButton")}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <style>{`
        .projects-title {
          transition:
            letter-spacing 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            text-shadow 1100ms ease;
        }

        .hero-frame:hover .projects-title {
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

        .group\\/media:hover .media-shine {
          animation: media-shine 1.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .projects-title {
            transition: none;
          }
          .hero-frame:hover .projects-title {
            transform: none;
          }
          .stat-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
