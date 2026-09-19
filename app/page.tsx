import Link from "next/link";
import { GlowMark } from "@/components/home/glow-mark";
import { StarField } from "@/components/home/star-field";
import {
  ExploreIcon,
  ProjectIcon,
  ForumIcon,
  ShopIcon,
} from "@/components/home/section-icons";

const sections = [
  {
    title: "EXPLORE",
    description: "Discover creations, worlds and ideas from the network.",
    href: "/explore",
    icon: ExploreIcon,
    number: "01",
  },
  {
    title: "PROJECTS",
    description: "Build ambitious worlds, concepts and creative projects.",
    href: "/projects",
    icon: ProjectIcon,
    number: "02",
  },
  {
    title: "FORUM",
    description: "Discuss theories, ideas and everything happening around ZETRAXUS.",
    href: "/forum",
    icon: ForumIcon,
    number: "03",
  },
  {
    title: "SHOP",
    description: "Explore digital creations, books, assets and physical products.",
    href: "/shop",
    icon: ShopIcon,
    number: "04",
  },
];

export default function Home() {
  return (
    <main className="w-full overflow-hidden px-5 pb-20 md:px-6">
      {/* HERO */}
      <section className="relative mx-auto mt-5 flex min-h-[540px] w-full max-w-[1280px] items-center overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#030303] md:min-h-[570px]">
        <div
          aria-hidden
          className="absolute left-1/2 top-[42%] h-[360px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-[110px]"
        />

        <div
          aria-hidden
          className="absolute left-1/2 top-[45%] h-[150px] w-[460px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[80px]"
        />

        <StarField />

        {/* subtle grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* side details */}
        <div className="absolute left-7 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-[9px] uppercase tracking-[3px] text-white/20 md:flex">
          <span>ZX / 001</span>
          <span className="h-px w-8 bg-white/15" />
          <span>ONLINE</span>
        </div>

        <div className="absolute right-7 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 text-[9px] uppercase tracking-[3px] text-white/20 md:flex">
          <span>NETWORK</span>
          <span className="h-px w-8 bg-white/15" />
          <span>2026</span>
        </div>

        <div className="relative z-10 mx-auto flex max-w-[850px] flex-col items-center px-6 text-center">
          <div className="mb-7 transition-transform duration-500 hover:scale-105">
            <GlowMark size={68} />
          </div>

          <p className="mb-5 text-[10px] font-medium uppercase tracking-[7px] text-white/35">
            DIGITAL CREATIVE NETWORK
          </p>

          <h1
            className="text-[44px] font-black leading-none tracking-[7px] text-white sm:text-[58px] md:text-[76px] md:tracking-[14px]"
            style={{
              textShadow:
                "0 0 20px rgba(255,255,255,0.7), 0 0 55px rgba(255,255,255,0.18)",
            }}
          >
            ZETRAXUS
          </h1>

          <p className="mt-6 max-w-[560px] text-sm leading-7 text-white/40 md:text-[15px]">
            A place to discover ideas, build worlds, create projects and
            connect through a growing digital network.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="group flex h-11 min-w-[145px] items-center justify-center rounded-full border border-white/50 bg-white text-[11px] font-bold tracking-[3px] text-black transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              EXPLORE
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/projects"
              className="flex h-11 min-w-[145px] items-center justify-center rounded-full border border-white/20 bg-white/[0.025] text-[11px] font-semibold tracking-[3px] text-white/75 transition-all duration-300 hover:border-white/50 hover:bg-white/[0.06] hover:text-white"
            >
              PROJECTS
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 text-[8px] uppercase tracking-[4px] text-white/20">
          <span className="h-px w-7 bg-white/15" />
          ENTER THE NETWORK
          <span className="h-px w-7 bg-white/15" />
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-[1280px] px-1 pt-24 pb-12 md:pt-32">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[5px] text-white/30">
              THE NETWORK
            </p>

            <h2 className="max-w-[650px] text-3xl font-semibold tracking-[-1px] text-white md:text-5xl">
              Everything begins with{" "}
              <span className="text-white/35">an idea.</span>
            </h2>
          </div>

          <p className="max-w-[360px] text-sm leading-6 text-white/35">
            ZETRAXUS connects discovery, creation, discussion and digital
            commerce inside one evolving platform.
          </p>
        </div>
      </section>

      {/* MAIN SECTIONS */}
      <section className="mx-auto grid max-w-[1280px] gap-3 md:grid-cols-2">
        {sections.map((section, index) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              className={`group relative min-h-[270px] overflow-hidden rounded-[24px] border border-white/[0.10] bg-[#080808] p-7 transition-all duration-500 hover:border-white/25 hover:bg-[#0c0c0c] ${
                index === 0 || index === 3 ? "md:min-h-[310px]" : ""
              }`}
            >
              <div
                aria-hidden
                className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/[0.025] blur-[70px] transition-all duration-700 group-hover:bg-white/[0.06]"
              />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] text-white/55 transition-all duration-500 group-hover:border-white/30 group-hover:text-white">
                    <Icon />
                  </div>

                  <span className="text-[9px] tracking-[3px] text-white/20">
                    {section.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {section.title}
                  </h3>

                  <p className="mt-3 max-w-[420px] text-sm leading-6 text-white/35">
                    {section.description}
                  </p>

                  <div className="mt-6 flex items-center gap-3 text-[10px] font-semibold tracking-[3px] text-white/45 transition-colors duration-300 group-hover:text-white">
                    ENTER
                    <span className="transition-transform duration-300 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto mt-3 max-w-[1280px]">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.10] bg-[#070707] p-7 md:p-9">
          <div
            aria-hidden
            className="absolute right-0 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/[0.025] blur-[90px]"
          />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="text-[9px] uppercase tracking-[5px] text-white/25">
                ZETRAXUS / SYSTEM
              </p>

              <h3 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                Create something worth discovering.
              </h3>
            </div>

            <Link
              href="/projects"
              className="flex h-11 shrink-0 items-center justify-center rounded-full border border-white/20 px-7 text-[10px] font-semibold tracking-[3px] text-white/60 transition-all duration-300 hover:border-white/50 hover:bg-white hover:text-black"
            >
              START A PROJECT
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER-LIKE END BAND */}
      <section className="mx-auto max-w-[1280px] px-1 pb-4 pt-28">
        <div className="flex flex-col items-center text-center">
          <GlowMark size={28} />

          <p className="mt-5 text-[10px] uppercase tracking-[5px] text-white/25">
            ZETRAXUS
          </p>

          <p className="mt-3 max-w-[420px] text-xs leading-6 text-white/25">
            Explore. Create. Connect.
          </p>
        </div>
      </section>
    </main>
  );
}
