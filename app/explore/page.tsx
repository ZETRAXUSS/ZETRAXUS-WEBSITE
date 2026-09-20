"use client";

import { useState } from "react";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const categories = ["All", "Projects", "Worlds", "Stories", "Characters", "Communities"];

const featured = [
  {
    number: "01",
    title: "FEATURED REALM",
    description:
      "Epic world building in progress, shaped by a growing circle of creators.",
  },
  {
    number: "02",
    title: "CHARACTER GALLERY",
    description:
      "Premium character design showcase spanning styles, genres and universes.",
  },
  {
    number: "03",
    title: "STORY ARCHIVE",
    description:
      "Narrative-driven creative works from across the ZETRAXUS network.",
  },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
        <div
          className="
            hero-frame group relative mx-auto flex
            min-h-[420px] w-full max-w-[1760px]
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

          {/* Atmosphere */}
          <div
            className="
              pointer-events-none absolute left-1/2 top-1/2
              h-[420px] w-[800px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-white/[0.03]
              blur-[130px]
              transition-all duration-[1800ms]
              ease-out
              group-hover:scale-[1.25]
              group-hover:bg-white/[0.05]
            "
          />

          {/* Cross line */}
          <div
            className="
              pointer-events-none absolute left-[7%] right-[7%] top-1/2
              h-px bg-white/[0.035]
              transition-all duration-[1200ms]
              group-hover:left-[4%]
              group-hover:right-[4%]
              group-hover:bg-white/[0.07]
            "
          />

          {/* Corner details */}
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
                DISCOVERY
              </p>
              <span className="h-px w-8 bg-white/15 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16 group-hover:bg-white/35" />
            </div>

            <h1 className="explore-title relative z-10 mt-5 text-[48px] font-black leading-none text-white sm:text-[60px] md:text-[76px] lg:text-[86px]">
              EXPLORE
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/35 md:text-base">
              Discover extraordinary projects, worlds and stories created by
              the community. Find inspiration and connect with other
              creators.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          SEARCH & FILTER
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 py-20 md:px-10 md:py-28">
        <ScrollReveal>
          <div className="mb-10">
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[5px] text-white/30">
              FIND SOMETHING
            </p>

            <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-5xl">
              Search the network.
            </h2>
          </div>

          <div className="space-y-6">
            <input
              type="text"
              placeholder="Search projects, worlds, stories..."
              className="
                w-full rounded-full border border-white/[0.12]
                bg-white/[0.025] px-6 py-4 text-sm text-white
                placeholder-white/25 outline-none
                transition-all duration-300
                focus:border-white/30 focus:bg-white/[0.04]
              "
            />

            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
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
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          FEATURED GRID
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 md:px-10 md:pb-40">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[5px] text-white/25">
              FEATURED
            </p>

            <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
              Community Highlights
            </h3>
          </div>

          <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
            {String(featured.length).padStart(2, "0")} PICKS
          </span>
        </div>

        <div className="grid gap-x-6 gap-y-16 md:grid-cols-3 md:gap-x-8">
          {featured.map((item, index) => (
            <ScrollReveal key={item.number} delay={index * 90}>
              <article className="group/media">
                <div
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
                      ITEM {item.number}
                    </span>
                  </div>

                  <span className="absolute left-5 top-5 text-[10px] tracking-[3px] text-white/25">
                    {item.number}
                  </span>

                  <span className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-white/10 transition-all duration-500 group-hover/media:h-6 group-hover/media:w-6 group-hover/media:border-white/30" />

                  <div className="media-shine pointer-events-none absolute -left-[60%] top-0 h-full w-[45%] skew-x-[-20deg] bg-white/[0.045]" />
                </div>

                <div className="mt-5">
                  <h4 className="text-[12px] font-semibold tracking-[3px] text-white/75 transition-all duration-500 group-hover/media:tracking-[3.5px] group-hover/media:text-white">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-white/30 transition-colors duration-500 group-hover/media:text-white/50">
                    {item.description}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <style>{`
        .explore-title {
          transition:
            letter-spacing 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            text-shadow 1100ms ease;
        }

        .hero-frame:hover .explore-title {
          letter-spacing: 4px;
          transform: scale(1.015);
          text-shadow:
            0 0 22px rgba(255,255,255,0.85),
            0 0 65px rgba(255,255,255,0.3);
        }

        @keyframes media-shine {
          0% { left: -60%; }
          45%, 100% { left: 130%; }
        }

        .group\\/media:hover .media-shine {
          animation: media-shine 1.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .explore-title {
            transition: none;
          }

          .hero-frame:hover .explore-title {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
