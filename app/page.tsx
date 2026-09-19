import Link from "next/link";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const mediaItems = [
  {
    number: "01",
    title: "EXPLORE",
    description:
      "Discover creations, ideas and stories emerging across the network.",
  },
  {
    number: "02",
    title: "PROJECTS",
    description:
      "Enter ambitious projects, worlds and concepts built by creators.",
  },
  {
    number: "03",
    title: "FORUM",
    description:
      "Discuss theories, ideas and everything happening inside the network.",
  },
  {
    number: "04",
    title: "SHOP",
    description:
      "Physical products, books, digital releases and creator-made assets.",
  },
  {
    number: "05",
    title: "CREATORS",
    description:
      "Meet the people shaping the worlds and projects of ZETRAXUS.",
  },
  {
    number: "06",
    title: "WORLDS",
    description:
      "Explore characters, lore and interconnected fictional universes.",
  },
  {
    number: "07",
    title: "DIGITAL",
    description:
      "A space for digital releases, resources and creative assets.",
  },
  {
    number: "08",
    title: "NETWORK",
    description:
      "One ecosystem connecting creation, discovery and community.",
  },
];

export default function Home() {
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
          "
        >
          <ParallaxField />
          <StarField />

          {/* Main atmospheric glow */}
          <div
            className="
              pointer-events-none absolute left-1/2 top-1/2
              h-[520px] w-[900px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-white/[0.035]
              blur-[130px]
              transition-all duration-[1800ms]
              group-hover:scale-125
              group-hover:bg-white/[0.055]
            "
          />

          {/* Slow orbital glow */}
          <div
            className="
              hero-orbit pointer-events-none absolute left-1/2 top-1/2
              h-[440px] w-[760px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full border border-white/[0.035]
            "
          />

          <div
            className="
              hero-orbit-reverse pointer-events-none absolute left-1/2 top-1/2
              h-[300px] w-[580px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full border border-white/[0.025]
            "
          />

          {/* Cinematic cross lines */}
          <div className="pointer-events-none absolute left-[7%] right-[7%] top-1/2 h-px bg-white/[0.035]" />
          <div className="pointer-events-none absolute bottom-[8%] left-1/2 top-[8%] w-px bg-white/[0.025]" />

          {/* Corner details */}
          <div className="pointer-events-none absolute left-7 top-7 h-7 w-7 border-l border-t border-white/[0.08] transition-all duration-700 group-hover:h-10 group-hover:w-10 group-hover:border-white/[0.18]" />

          <div className="pointer-events-none absolute right-7 top-7 h-7 w-7 border-r border-t border-white/[0.08] transition-all duration-700 group-hover:h-10 group-hover:w-10 group-hover:border-white/[0.18]" />

          <div className="pointer-events-none absolute bottom-7 left-7 h-7 w-7 border-b border-l border-white/[0.08] transition-all duration-700 group-hover:h-10 group-hover:w-10 group-hover:border-white/[0.18]" />

          <div className="pointer-events-none absolute bottom-7 right-7 h-7 w-7 border-b border-r border-white/[0.08] transition-all duration-700 group-hover:h-10 group-hover:w-10 group-hover:border-white/[0.18]" />

          {/* =====================================================
              HERO CONTENT
          ====================================================== */}

          <div className="relative z-10 flex flex-col items-center">
            {/* User's actual ZETRAXUS emblem */}
            <div className="relative flex items-center justify-center">
              {/* Large soft aura behind the emblem */}
              <div
                className="
                  absolute h-40 w-40
                  rounded-full
                  bg-white/[0.055]
                  blur-[45px]
                  transition-all duration-1000
                  group-hover:h-52
                  group-hover:w-52
                  group-hover:bg-white/[0.09]
                "
              />

              {/* Secondary halo */}
              <div
                className="
                  absolute h-28 w-28
                  rounded-full
                  border border-white/[0.06]
                  shadow-[0_0_60px_rgba(255,255,255,0.08)]
                  transition-all duration-1000
                  group-hover:scale-125
                  group-hover:border-white/[0.12]
                "
              />

              {/* Actual uploaded logo */}
              <img
                src="/zetraxus-mark.png"
                alt=""
                className="
                  relative z-10
                  h-24 w-24
                  object-contain
                  opacity-80
                  blur-[0.15px]
                  drop-shadow-[0_0_18px_rgba(255,255,255,0.5)]
                  transition-all duration-1000
                  group-hover:scale-110
                  group-hover:opacity-100
                  group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.75)]
                  md:h-28 md:w-28
                "
              />
            </div>

            {/* Brand */}
            <div className="relative mt-5 flex flex-col items-center">
              {/* Extremely subtle logo-like light behind text */}
              <div
                className="
                  pointer-events-none absolute left-1/2 top-1/2
                  h-24 w-[420px]
                  -translate-x-1/2 -translate-y-1/2
                  bg-white/[0.025]
                  blur-[55px]
                "
              />

              <h1
                className="
                  relative z-10
                  text-[48px] font-black leading-none
                  tracking-[9px] text-white
                  transition-all duration-700
                  group-hover:tracking-[11px]
                  sm:text-[60px]
                  md:text-[76px]
                  md:tracking-[15px]
                  lg:text-[86px]
                "
                style={{
                  textShadow:
                    "0 0 18px rgba(255,255,255,0.72), 0 0 55px rgba(255,255,255,0.22)",
                }}
              >
                ZETRAXUS
              </h1>

              <div className="mt-5 flex items-center gap-4">
                <span className="h-px w-8 bg-white/15 transition-all duration-700 group-hover:w-14 group-hover:bg-white/30" />

                <p className="text-[10px] font-medium tracking-[6px] text-white/35 md:text-[12px] md:tracking-[8px]">
                  ENTER THE NETWORK
                </p>

                <span className="h-px w-8 bg-white/15 transition-all duration-700 group-hover:w-14 group-hover:bg-white/30" />
              </div>
            </div>

            {/* Enter */}
            <Link
              href="/explore"
              className="
                relative mt-10 flex h-12 w-40
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
                hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]
              "
            >
              <span
                className="
                  absolute inset-y-0 -left-full w-1/2
                  skew-x-[-20deg]
                  bg-white/20
                  transition-all duration-700
                  hover:left-[130%]
                "
              />

              <span className="relative z-10">ENTER</span>
            </Link>
          </div>

          {/* Bottom indicator */}
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
            <span className="text-[9px] uppercase tracking-[4px] text-white/20 transition-colors duration-500 group-hover:text-white/35">
              Scroll to explore
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
                THE NETWORK
              </p>

              <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
                A network built
                <br />
                <span className="text-white/35">for creation.</span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/35 md:justify-self-end md:text-base">
              ZETRAXUS brings projects, worlds, discussions, creators and
              digital creations into one evolving network.
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
              DISCOVER
            </p>

            <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
              Inside ZETRAXUS
            </h3>
          </div>

          <span className="hidden text-[10px] tracking-[3px] text-white/20 md:block">
            08 AREAS
          </span>
        </div>

        <div className="grid gap-x-6 gap-y-16 md:grid-cols-2 md:gap-x-8 md:gap-y-20">
          {mediaItems.map((item, index) => (
            <ScrollReveal key={item.number} delay={index * 70}>
              <article className="group/media">
                {/* Media */}
                <div
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
                  {/* Inner frame */}
                  <div className="absolute inset-3 rounded-[18px] border border-white/[0.035] transition-all duration-700 group-hover/media:border-white/[0.08]" />

                  {/* Center atmosphere */}
                  <div
                    className="
                      absolute left-1/2 top-1/2
                      h-32 w-64
                      -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-white/[0.025]
                      blur-[55px]
                      transition-all duration-700
                      group-hover/media:scale-150
                      group-hover/media:bg-white/[0.05]
                    "
                  />

                  {/* Media placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-[4px] text-white/15 transition-all duration-500 group-hover/media:tracking-[6px] group-hover/media:text-white/35">
                      MEDIA {item.number}
                    </span>
                  </div>

                  {/* Number */}
                  <span className="absolute left-5 top-5 text-[10px] tracking-[3px] text-white/25">
                    {item.number}
                  </span>

                  {/* Corner */}
                  <span className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-white/10 transition-all duration-500 group-hover/media:h-6 group-hover/media:w-6 group-hover/media:border-white/30" />

                  {/* Moving light */}
                  <div
                    className="
                      media-shine pointer-events-none absolute
                      -left-[60%] top-0 h-full w-[45%]
                      skew-x-[-20deg]
                      bg-white/[0.045]
                    "
                  />
                </div>

                {/* Description */}
                <div className="mt-5 flex gap-6">
                  <h4 className="min-w-[110px] text-[12px] font-semibold tracking-[3px] text-white/75 transition-all duration-500 group-hover/media:tracking-[3.5px] group-hover/media:text-white">
                    {item.title}
                  </h4>

                  <p className="max-w-md text-sm leading-6 text-white/30 transition-colors duration-500 group-hover/media:text-white/50">
                    {item.description}
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
          <div className="group/feature overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#060606] transition-all duration-700 hover:border-white/[0.18] hover:shadow-[0_25px_90px_rgba(0,0,0,0.5)]">
            <div className="grid min-h-[460px] md:grid-cols-[1.35fr_0.65fr]">
              <div className="relative flex items-end overflow-hidden border-b border-white/[0.08] p-8 md:border-b-0 md:border-r md:p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.07),transparent_55%)] transition-transform duration-[1200ms] group-hover/feature:scale-125" />

                <div className="absolute right-[15%] top-[20%] h-32 w-32 rounded-full border border-white/[0.035] transition-all duration-1000 group-hover/feature:scale-150 group-hover/feature:border-white/[0.08]" />

                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                    FEATURED CREATION
                  </p>

                  <h3 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.035em] transition-transform duration-700 group-hover/feature:translate-x-1 md:text-6xl">
                    The next world
                    <br />
                    <span className="text-white/35">starts here.</span>
                  </h3>
                </div>
              </div>

              <div className="flex flex-col justify-between p-8 md:p-12">
                <p className="max-w-sm text-sm leading-7 text-white/35">
                  A dedicated space for large creative projects, fictional
                  worlds, characters, lore and experiences.
                </p>

                <Link
                  href="/projects"
                  className="mt-10 inline-flex w-fit border-b border-white/25 pb-2 text-[10px] font-semibold tracking-[3px] text-white/60 transition-all duration-500 hover:border-white hover:pl-2 hover:text-white"
                >
                  VIEW PROJECTS →
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
                SHOP
              </p>

              <h3 className="mt-4 text-4xl font-medium tracking-[-0.035em] md:text-6xl">
                Creations
                <br />
                <span className="text-white/35">worth keeping.</span>
              </h3>
            </div>

            <div className="md:justify-self-end">
              <p className="max-w-md text-sm leading-7 text-white/35">
                Physical products, books, digital books and creator-made
                digital assets will live inside the ZETRAXUS marketplace.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex border-b border-white/25 pb-2 text-[10px] font-semibold tracking-[3px] text-white/60 transition-all duration-500 hover:border-white hover:pl-2 hover:text-white"
              >
                ENTER SHOP →
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
          <div className="group/cta relative mx-auto flex min-h-[430px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center transition-all duration-700 hover:border-white/[0.18]">
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
                CREATE. EXPLORE. CONNECT.
              </h3>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">
                The network is only the beginning.
              </p>

              <Link
                href="/explore"
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
                ENTER ZETRAXUS
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================
          PAGE ANIMATIONS
      ========================================================== */}

      <style>{`
        @keyframes hero-orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes hero-orbit-reverse {
          0% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes hero-scroll {
          0%,
          100% {
            opacity: 0.25;
            transform: scaleY(0.65);
            transform-origin: top;
          }
          50% {
            opacity: 0.8;
            transform: scaleY(1);
            transform-origin: top;
          }
        }

        @keyframes media-shine {
          0% {
            left: -60%;
          }
          45%,
          100% {
            left: 130%;
          }
        }

        .hero-orbit {
          animation: hero-orbit 28s linear infinite;
        }

        .hero-orbit-reverse {
          animation: hero-orbit-reverse 20s linear infinite;
        }

        .hero-scroll-line {
          animation: hero-scroll 2.4s ease-in-out infinite;
        }

        .group\\/media:hover .media-shine {
          animation: media-shine 1.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-orbit,
          .hero-orbit-reverse,
          .hero-scroll-line {
            animation: none;
          }

          .group\\/media:hover .media-shine {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
