import Link from "next/link";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { SplitText } from "@/components/fx/split-text";
import { getServerT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n/translate";

const mediaItems: { number: string; key: string }[] = [
  { number: "01", key: "explore" },
  { number: "02", key: "projects" },
  { number: "03", key: "forum" },
  { number: "04", key: "shop" },
  { number: "05", key: "creators" },
  { number: "06", key: "worlds" },
  { number: "07", key: "digital" },
  { number: "08", key: "network" },
];

export default async function Home() {
  const { t } = await getServerT();
  const m = (key: string, part: "title" | "desc") => t(`home.media.${key}.${part}` as TranslationKey);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
        <div
          className="
            hero-frame group relative mx-auto flex
            min-h-[680px] w-full max-w-[1760px]
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

          {/* =====================================================
              ATMOSPHERE
          ====================================================== */}

          <div
            className="
              pointer-events-none absolute left-1/2 top-1/2
              h-[520px] w-[900px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-white/[0.055]
              opacity-[0.55]
              blur-[130px]
              transition-[transform,opacity] duration-[1800ms]
              ease-out
              will-change-transform
              group-hover:scale-[1.3]
              group-hover:opacity-100
            "
          />

          <div
            className="
              pointer-events-none absolute left-1/2 top-1/2
              h-[280px] w-[700px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-white/[0.035]
              opacity-50
              blur-[90px]
              transition-[transform,opacity] duration-[2200ms]
              group-hover:scale-125
              group-hover:opacity-100
            "
          />

          {/* Cinematic cross lines */}
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

          <div
            className="
              pointer-events-none absolute bottom-[8%] left-1/2 top-[8%]
              w-px bg-white/[0.025]
              transition-all duration-[1200ms]
              group-hover:bottom-[5%]
              group-hover:top-[5%]
              group-hover:bg-white/[0.05]
            "
          />

          {/* =====================================================
              CORNER DETAILS
          ====================================================== */}

          <div
            className="
              pointer-events-none absolute left-7 top-7
              h-7 w-7 border-l border-t border-white/[0.08]
              transition-all duration-700 ease-out
              group-hover:h-11 group-hover:w-11
              group-hover:border-white/[0.2]
            "
          />

          <div
            className="
              pointer-events-none absolute right-7 top-7
              h-7 w-7 border-r border-t border-white/[0.08]
              transition-all duration-700 ease-out
              group-hover:h-11 group-hover:w-11
              group-hover:border-white/[0.2]
            "
          />

          <div
            className="
              pointer-events-none absolute bottom-7 left-7
              h-7 w-7 border-b border-l border-white/[0.08]
              transition-all duration-700 ease-out
              group-hover:h-11 group-hover:w-11
              group-hover:border-white/[0.2]
            "
          />

          <div
            className="
              pointer-events-none absolute bottom-7 right-7
              h-7 w-7 border-b border-r border-white/[0.08]
              transition-all duration-700 ease-out
              group-hover:h-11 group-hover:w-11
              group-hover:border-white/[0.2]
            "
          />

          {/* =====================================================
              HERO CONTENT
          ====================================================== */}

          <div
            className="
              relative z-10 flex flex-col items-center
              transition-transform duration-[1200ms]
              ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:-translate-y-1
            "
          >
            {/* =================================================
                LOGO
            ================================================== */}

            <div className="relative -mt-16 flex items-center justify-center md:-mt-20">
              {/* Large aura */}
              <div
                className="
                  hero-aura-breathe
                  absolute h-56 w-56 rounded-full
                  bg-white/[0.045]
                  blur-[50px]
                  transition-all duration-[1400ms]
                  ease-out
                  group-hover:h-72
                  group-hover:w-72
                  group-hover:bg-white/[0.09]
                "
              />

              {/* Soft secondary glow */}
              <div
                className="
                  absolute h-40 w-40 rounded-full
                  bg-white/[0.025]
                  blur-[25px]
                  transition-all duration-1000
                  group-hover:scale-150
                  group-hover:bg-white/[0.05]
                "
              />

              {/* Actual ZETRAXUS logo */}
              <img
                src="/zetraxus-mark.png"
                alt=""
                className="
                  relative z-10
                  h-40 w-40
                  object-contain
                  opacity-75
                  drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]
                  transition-all duration-[1200ms]
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                  group-hover:scale-[1.12]
                  group-hover:opacity-100
                  group-hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.8)]
                  md:h-52 md:w-52
                "
              />
            </div>

            {/* =================================================
                BRAND
            ================================================== */}

            <div className="relative mt-5 flex flex-col items-center">
              <div
                className="
                  pointer-events-none absolute left-1/2 top-1/2
                  h-24 w-[440px]
                  -translate-x-1/2 -translate-y-1/2
                  bg-white/[0.02]
                  blur-[60px]
                  transition-all duration-[1600ms]
                  group-hover:w-[560px]
                  group-hover:bg-white/[0.035]
                "
              />

              <h1
                className="
                  hero-title relative z-10
                  text-[48px] font-black leading-none
                  text-white
                  sm:text-[60px]
                  md:text-[76px]
                  lg:text-[86px]
                "
              >
                <SplitText text="ZETRAXUS" delay={200} stagger={60} />
              </h1>

              <div className="mt-5 flex items-center gap-4">
                <span
                  className="
                    h-px w-8 bg-white/15
                    transition-all duration-[1200ms]
                    ease-[cubic-bezier(0.16,1,0.3,1)]
                    group-hover:w-16
                    group-hover:bg-white/35
                  "
                />

                <p
                  className="
                    text-[10px] font-medium
                    tracking-[6px] text-white/35
                    transition-all duration-1000
                    group-hover:tracking-[8px]
                    group-hover:text-white/55
                    md:text-[12px]
                  "
                >
                  {t("home.hero.tagline")}
                </p>

                <span
                  className="
                    h-px w-8 bg-white/15
                    transition-all duration-[1200ms]
                    ease-[cubic-bezier(0.16,1,0.3,1)]
                    group-hover:w-16
                    group-hover:bg-white/35
                  "
                />
              </div>
            </div>

            {/* =================================================
                ENTER BUTTON
            ================================================== */}

            <Link
              href="/explore"
              data-magnetic="0.25"
              data-sound="whoosh"
              className="
                hero-enter group/enter relative mt-10
                flex h-12 w-40
                items-center justify-center
                overflow-hidden rounded-full
                border border-white/35
                bg-white/[0.025]
                text-[12px] font-semibold
                tracking-[3px] text-white
                shadow-[0_0_20px_rgba(255,255,255,0.08)]
                transition-all duration-500
                hover:border-white
                hover:bg-white
                hover:text-black
                hover:shadow-[0_0_45px_rgba(255,255,255,0.28)]
              "
            >
              <span
                className="
                  pointer-events-none absolute
                  -left-[100%] top-0
                  h-full w-[55%]
                  skew-x-[-20deg]
                  bg-white/25
                  transition-all duration-700
                  group-hover/enter:left-[150%]
                "
              />

              <span className="relative z-10 transition-transform duration-300 group-hover/enter:scale-105">
                {t("home.hero.enter")}
              </span>
            </Link>
          </div>

          {/* =====================================================
              SCROLL INDICATOR
          ====================================================== */}

          <div
            className="
              absolute bottom-7 left-1/2
              flex -translate-x-1/2
              flex-col items-center gap-3
              transition-all duration-700
              group-hover:translate-y-1
            "
          >
            <span className="text-[9px] uppercase tracking-[4px] text-white/20 transition-colors duration-500 group-hover:text-white/40">
              {t("home.hero.scroll")}
            </span>

            <span className="hero-scroll-line h-7 w-px bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRODUCTION
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 py-32 md:px-10 md:py-40">
        <ScrollReveal>
          <div className="grid gap-10 md:grid-cols-[1fr_0.7fr] md:items-end">
            <div>
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[5px] text-white/30">
                {t("home.intro.eyebrow")}
              </p>

              <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
                {t("home.intro.title1")}
                <br />
                <span className="text-white/35 transition-colors duration-700 hover:text-white/55">
                  {t("home.intro.title2")}
                </span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/35 md:justify-self-end md:text-base">
              {t("home.intro.text")}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          MEDIA GRID
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 md:px-10 md:pb-40">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[5px] text-white/25">
              {t("home.grid.eyebrow")}
            </p>

            <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
              {t("home.grid.title")}
            </h3>
          </div>

          <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
            08 {t("home.grid.areas")}
          </span>
        </div>

        <div className="grid gap-x-6 gap-y-16 md:grid-cols-2 md:gap-x-8 md:gap-y-20">
          {mediaItems.map((item, index) => (
            <ScrollReveal key={item.number} delay={index * 70}>
              <article className="group/media">
                <div
                  data-spotlight
                  className="
                    relative aspect-[16/8]
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

                  <div
                    className="
                      absolute left-1/2 top-1/2
                      h-32 w-64
                      -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-white/[0.05]
                      opacity-50
                      blur-[55px]
                      transition-[transform,opacity] duration-700
                      group-hover/media:scale-150
                      group-hover/media:opacity-100
                    "
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-[4px] text-white/15 transition-all duration-500 group-hover/media:tracking-[6px] group-hover/media:text-white/35">
                      {t("home.grid.media")} {item.number}
                    </span>
                  </div>

                  <span className="absolute left-5 top-5 text-[10px] tracking-[3px] text-white/25">
                    {item.number}
                  </span>

                  <span className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-white/10 transition-all duration-500 group-hover/media:h-6 group-hover/media:w-6 group-hover/media:border-white/30" />

                  <div className="media-shine pointer-events-none absolute -left-[60%] top-0 h-full w-[45%] skew-x-[-20deg] bg-white/[0.045]" />
                </div>

                <div className="mt-5 flex gap-6">
                  <h4 className="min-w-[110px] text-[12px] font-semibold tracking-[3px] text-white/75 transition-all duration-500 group-hover/media:tracking-[3.5px] group-hover/media:text-white">
                    {m(item.key, "title")}
                  </h4>

                  <p className="max-w-md text-sm leading-6 text-white/30 transition-colors duration-500 group-hover/media:text-white/50">
                    {m(item.key, "desc")}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* =========================================================
          FEATURED CREATION
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 md:px-10 md:pb-40">
        <ScrollReveal>
          <div data-spotlight className="group/feature relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#060606] transition-all duration-700 hover:border-white/[0.18] hover:shadow-[0_25px_90px_rgba(0,0,0,0.5)]">
            <div className="grid min-h-[460px] md:grid-cols-[1.35fr_0.65fr]">
              <div className="relative flex items-end overflow-hidden border-b border-white/[0.08] p-8 md:border-b-0 md:border-r md:p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.07),transparent_55%)] transition-transform duration-[1200ms] group-hover/feature:scale-125" />

                <div className="absolute right-[15%] top-[20%] h-32 w-32 rounded-full border border-white/[0.035] transition-all duration-1000 group-hover/feature:scale-150 group-hover/feature:border-white/[0.08]" />

                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                    {t("home.featured.eyebrow")}
                  </p>

                  <h3 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.035em] transition-transform duration-700 group-hover/feature:translate-x-1 md:text-6xl">
                    {t("home.featured.title1")}
                    <br />
                    <span className="text-white/35">{t("home.featured.title2")}</span>
                  </h3>
                </div>
              </div>

              <div className="flex flex-col justify-between p-8 md:p-12">
                <p className="max-w-sm text-sm leading-7 text-white/35">
                  {t("home.featured.text")}
                </p>

                <Link
                  href="/projects"
                  className="mt-10 inline-flex w-fit border-b border-white/25 pb-2 text-[10px] font-semibold tracking-[3px] text-white/60 transition-all duration-500 hover:border-white hover:pl-2 hover:text-white"
                >
                  {t("home.featured.cta")} →
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          SHOP
      ========================================================== */}

      <section className="mx-auto w-full max-w-[1760px] px-6 pb-32 md:px-10 md:pb-40">
        <ScrollReveal>
          <div className="grid gap-10 md:grid-cols-[0.6fr_1.4fr] md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                {t("nav.shop").toUpperCase()}
              </p>

              <h3 className="mt-4 text-4xl font-medium tracking-[-0.035em] md:text-6xl">
                {t("home.shop.title1")}
                <br />
                <span className="text-white/35">{t("home.shop.title2")}</span>
              </h3>
            </div>

            <div className="md:justify-self-end">
              <p className="max-w-md text-sm leading-7 text-white/35">
                {t("home.shop.text")}
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex border-b border-white/25 pb-2 text-[10px] font-semibold tracking-[3px] text-white/60 transition-all duration-500 hover:border-white hover:pl-2 hover:text-white"
              >
                {t("home.shop.cta")} →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="px-6 pb-10 md:px-10">
        <ScrollReveal>
          <div data-spotlight className="group/cta relative mx-auto flex min-h-[430px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center transition-all duration-700 hover:border-white/[0.18]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_60%)] transition-transform duration-[1500ms] group-hover/cta:scale-125" />

            <div className="relative z-10">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-white/[0.04] blur-xl transition-all duration-700 group-hover/cta:scale-150 group-hover/cta:bg-white/[0.08]" />

                <img
                  src="/zetraxus-mark.png"
                  alt=""
                  className="relative h-12 w-12 object-contain opacity-70 drop-shadow-[0_0_15px_rgba(255,255,255,0.45)] transition-all duration-700 group-hover/cta:scale-110 group-hover/cta:opacity-100"
                />
              </div>

              <h3 className="mt-7 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                {t("home.cta.title")}
              </h3>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">
                {t("home.cta.text")}
              </p>

              <Link
                href="/explore"
                data-magnetic="0.2"
                className="
                  mt-8 inline-flex h-11
                  items-center rounded-full
                  border border-white/25
                  px-7
                  text-[10px] font-semibold
                  tracking-[3px] text-white/70
                  transition-all duration-500
                  hover:border-white
                  hover:bg-white
                  hover:text-black
                  hover:shadow-[0_0_30px_rgba(255,255,255,0.18)]
                "
              >
                {t("home.cta.button")}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <style>{`
        .hero-title {
          transition:
            letter-spacing 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 1100ms cubic-bezier(0.16, 1, 0.3, 1),
            text-shadow 1100ms ease;
        }

        .hero-frame:hover .hero-title {
          letter-spacing: 8px;
          transform: scale(1.015);
          text-shadow:
            0 0 22px rgba(255,255,255,0.85),
            0 0 65px rgba(255,255,255,0.3);
        }

        @keyframes hero-scroll {
          0%, 100% {
            opacity: 0.2;
            transform: scaleY(0.55);
            transform-origin: top;
          }
          50% {
            opacity: 0.8;
            transform: scaleY(1);
            transform-origin: top;
          }
        }

        @keyframes media-shine {
          0% { left: -60%; }
          45%, 100% { left: 130%; }
        }

        .hero-scroll-line {
          animation: hero-scroll 2.4s ease-in-out infinite;
        }

        .group\\/media:hover .media-shine {
          animation: media-shine 1.4s ease-out;
        }

        @keyframes hero-aura-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .hero-aura-breathe {
          animation: hero-aura-breathe 4.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-title {
            transition: none;
          }

          .hero-frame:hover .hero-title {
            letter-spacing: 15px;
            transform: none;
          }

          .hero-scroll-line,
          .hero-aura-breathe {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
