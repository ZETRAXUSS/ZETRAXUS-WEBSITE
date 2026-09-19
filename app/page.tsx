import Link from "next/link";
import { GlowMark } from "@/components/home/glow-mark";
import { StarField } from "@/components/home/star-field";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const mediaItems = [
  {
    number: "01",
    title: "EXPLORE",
    description: "Discover creations, ideas and stories emerging across the network.",
  },
  {
    number: "02",
    title: "PROJECTS",
    description: "Enter ambitious projects, worlds and concepts built by creators.",
  },
  {
    number: "03",
    title: "FORUM",
    description: "Discuss theories, ideas and everything happening inside the network.",
  },
  {
    number: "04",
    title: "SHOP",
    description: "Physical products, books, digital releases and creator-made assets.",
  },
  {
    number: "05",
    title: "CREATORS",
    description: "Meet the people shaping the worlds and projects of ZETRAXUS.",
  },
  {
    number: "06",
    title: "WORLDS",
    description: "Explore characters, lore and interconnected fictional universes.",
  },
  {
    number: "07",
    title: "DIGITAL",
    description: "A space for digital releases, resources and creative assets.",
  },
  {
    number: "08",
    title: "NETWORK",
    description: "One ecosystem connecting creation, discovery and community.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
        <div
          className="
            relative mx-auto flex
            min-h-[680px] w-full max-w-[1760px]
            flex-col items-center justify-center
            overflow-hidden rounded-[32px]
            border border-white/[0.12]
            bg-[#030303]
          "
        >
          <ParallaxField />
          <StarField />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_58%)]" />

          {/* Subtle cinematic lines */}
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 h-px bg-white/[0.035]" />
          <div className="pointer-events-none absolute bottom-[10%] left-1/2 top-[10%] w-px bg-white/[0.025]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="animate-pulse">
              <GlowMark size={78} />
            </div>

            <div className="mt-9 flex flex-col items-center">
              <h1
                className="
                  text-[48px] font-black leading-none
                  tracking-[9px] text-white
                  sm:text-[60px]
                  md:text-[76px] md:tracking-[15px]
                  lg:text-[86px]
                "
                style={{
                  textShadow:
                    "0 0 20px rgba(255,255,255,0.75), 0 0 60px rgba(255,255,255,0.25)",
                }}
              >
                ZETRAXUS
              </h1>

              <p className="mt-5 text-[10px] font-medium tracking-[6px] text-white/35 md:text-[12px] md:tracking-[8px]">
                ENTER THE NETWORK
              </p>
            </div>

            <Link
              href="/explore"
              className="
                mt-10 flex h-12 w-40
                items-center justify-center
                rounded-full
                border border-white/35
                bg-white/[0.025]
                text-[12px] font-semibold
                tracking-[3px] text-white
                shadow-[0_0_20px_rgba(255,255,255,0.08)]
                transition-all duration-300
                hover:border-white
                hover:bg-white
                hover:text-black
                hover:shadow-[0_0_35px_rgba(255,255,255,0.25)]
              "
            >
              ENTER
            </Link>
          </div>

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[4px] text-white/20">
            Scroll to explore
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
                for creation.
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
            <ScrollReveal key={item.number} delay={index * 50}>
              <article className="group">
                {/* Media area */}
                <div
                  className="
                    relative aspect-[16/8]
                    overflow-hidden rounded-[24px]
                    border border-white/[0.1]
                    bg-[#080808]
                    transition-all duration-500
                    group-hover:border-white/[0.22]
                    group-hover:bg-[#0b0b0b]
                  "
                >
                  {/* Placeholder media frame */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-[4px] text-white/15 transition-colors duration-500 group-hover:text-white/30">
                      MEDIA {item.number}
                    </span>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Number */}
                  <span className="absolute left-5 top-5 text-[10px] tracking-[3px] text-white/25">
                    {item.number}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-5 flex gap-6">
                  <h4 className="min-w-[110px] text-[12px] font-semibold tracking-[3px] text-white/75">
                    {item.title}
                  </h4>

                  <p className="max-w-md text-sm leading-6 text-white/30 transition-colors duration-300 group-hover:text-white/45">
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
          <div className="overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#060606]">
            <div className="grid min-h-[460px] md:grid-cols-[1.35fr_0.65fr]">
              <div className="relative flex items-end overflow-hidden border-b border-white/[0.08] p-8 md:border-b-0 md:border-r md:p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.07),transparent_55%)]" />

                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[5px] text-white/25">
                    FEATURED CREATION
                  </p>

                  <h3 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.035em] md:text-6xl">
                    The next world
                    <br />
                    starts here.
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
                  className="mt-10 inline-flex w-fit items-center border-b border-white/25 pb-2 text-[10px] font-semibold tracking-[3px] text-white/60 transition-colors hover:border-white hover:text-white"
                >
                  VIEW PROJECTS
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
                worth keeping.
              </h3>
            </div>

            <div className="md:justify-self-end">
              <p className="max-w-md text-sm leading-7 text-white/35">
                Physical products, books, digital books and creator-made
                digital assets will live inside the ZETRAXUS marketplace.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex border-b border-white/25 pb-2 text-[10px] font-semibold tracking-[3px] text-white/60 transition-colors hover:border-white hover:text-white"
              >
                ENTER SHOP
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
          <div className="relative mx-auto flex min-h-[430px] w-full max-w-[1760px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white/[0.1] bg-[#050505] text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_60%)]" />

            <div className="relative z-10">
              <GlowMark size={52} />

              <h3 className="mt-7 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                CREATE. EXPLORE. CONNECT.
              </h3>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/30">
                The network is only the beginning.
              </p>

              <Link
                href="/explore"
                className="mt-8 inline-flex h-11 items-center rounded-full border border-white/25 px-7 text-[10px] font-semibold tracking-[3px] text-white/70 transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
              >
                ENTER ZETRAXUS
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
