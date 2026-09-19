import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlowMark } from "@/components/home/glow-mark";
import { ParallaxField } from "@/components/home/parallax-field";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import {
  ExploreIcon,
  ForumIcon,
  ProjectIcon,
  ShopIcon,
} from "@/components/home/section-icons";

const sections = [
  {
    href: "/explore",
    title: "Explore",
    description: "See what people are building across Zetraxus.",
    Icon: ExploreIcon,
  },
  {
    href: "/projects",
    title: "Projects",
    description: "Worlds, characters and work in progress, organized.",
    Icon: ProjectIcon,
  },
  {
    href: "/forum",
    title: "Forum",
    description: "Discussions between creators and communities.",
    Icon: ForumIcon,
  },
  {
    href: "/shop",
    title: "Shop",
    description: "Digital and physical goods made by the people here.",
    Icon: ShopIcon,
  },
];

const stats = [
  { value: "∞", label: "Creators" },
  { value: "4", label: "Core Sections" },
  { value: "24/7", label: "Open Platform" },
];

export default function Home() {
  return (
    <div className="relative">
      {/* ===== HERO — framed viewport, docked directly under the header ===== */}
      <section className="relative pt-8 pb-24 md:pt-12 md:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-surface-light/40 via-surface/70 to-background">
            <ParallaxField />
            {/* inner hairline gives the panel a "viewport" edge */}
            <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-white/[0.05]" />

            <div className="relative flex flex-col items-center px-6 py-20 text-center md:py-28">
              <div className="animate-fade-in">
                <GlowMark size={44} />
              </div>

              <p
                className="mt-8 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white animate-fade-in"
                style={{ animationDelay: "80ms" }}
              >
                Creative Platform
              </p>

              <h1
                className="mt-8 font-display text-6xl font-black leading-[0.95] tracking-tight text-foreground animate-slide-up md:text-8xl"
                style={{ animationDelay: "140ms" }}
              >
                Build. Share. Create.
              </h1>

              <p
                className="mt-6 max-w-xl text-base leading-relaxed text-muted/80 animate-slide-up md:text-lg"
                style={{ animationDelay: "200ms" }}
              >
                One place for creators to build worlds, share projects, and
                find the people who care about the same things they do.
              </p>

              <div
                className="mt-10 flex flex-col gap-4 animate-slide-up sm:flex-row"
                style={{ animationDelay: "260ms" }}
              >
                <Button href="/explore">Explore Now</Button>
                <Button href="/projects" variant="secondary">
                  View Projects
                </Button>
              </div>

              <div
                className="mt-16 flex items-center animate-fade-in"
                style={{ animationDelay: "340ms" }}
              >
                {stats.map((stat, idx) => (
                  <Fragment key={stat.label}>
                    {idx > 0 && (
                      <span className="mx-6 h-8 w-px bg-white/10 md:mx-9" />
                    )}
                    <div className="text-center">
                      <p className="font-display text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-faint">
                        {stat.label}
                      </p>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative pb-24 md:pb-32">
        <Container className="space-y-14">
          <ScrollReveal className="max-w-2xl space-y-4">
            <p className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Platform
            </p>
            <h2 className="font-display text-5xl font-black leading-[1] text-foreground md:text-6xl">
              Everything you need
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section, idx) => (
              <ScrollReveal key={section.href} delay={idx * 90}>
                <Link href={section.href} className="group block h-full">
                  <Card className="flex h-full flex-col bg-surface-light/30 p-8 hover:bg-surface-light/50 cursor-pointer">
                    <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] text-foreground/70 transition-colors duration-300 group-hover:border-white/25 group-hover:text-white">
                      <section.Icon />
                    </div>
                    <h3 className="mb-3 font-display text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-white md:text-3xl">
                      {section.title}
                    </h3>
                    <p className="flex-1 text-sm text-muted/70 transition-colors duration-300 group-hover:text-muted/90 md:text-base">
                      {section.description}
                    </p>
                    <div className="mt-6 text-sm font-semibold text-white/0 transition-all duration-300 group-hover:text-white/40">
                      Explore →
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== CLOSING BAND — echoes the hero frame, bookending the page ===== */}
      <section className="relative border-t border-white/10 py-20 md:py-28">
        <Container>
          <ScrollReveal className="relative overflow-hidden rounded-[20px] border border-white/10 bg-surface-light/20 px-8 py-12 md:px-14 md:py-16">
            <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-white/[0.05] blur-3xl" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-3">
                <h2 className="font-display text-3xl font-black text-foreground md:text-4xl">
                  Ready to create something extraordinary?
                </h2>
                <p className="text-muted/80">
                  Join a community of creators building the future of digital
                  creative platforms.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button href="/explore">Start Exploring</Button>
                <Button href="/projects" variant="secondary">
                  Browse Projects
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
