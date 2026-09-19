import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dummy icon components for visual hierarchy
function IconProject() {
  return <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-2xl">📐</div>;
}

function IconForum() {
  return <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-2xl">💬</div>;
}

function IconShop() {
  return <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-2xl">🛍</div>;
}

function IconWorld() {
  return <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-2xl">🌍</div>;
}

const sections = [
  {
    href: "/explore",
    title: "Explore",
    description: "See what people are building across Zetraxus.",
  },
  {
    href: "/projects",
    title: "Projects",
    description: "Worlds, characters and work in progress, organized.",
  },
  {
    href: "/forum",
    title: "Forum",
    description: "Discussions between creators and communities.",
  },
  {
    href: "/shop",
    title: "Shop",
    description: "Digital and physical goods made by the people here.",
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* ===== HERO SECTION - Premium Cinematic ===== */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden border-b border-white/10">
        {/* Dynamic background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
          <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl bg-white" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/3 via-transparent to-transparent" />
        </div>

        <Container className="relative py-32 space-y-12">
          {/* Eyebrow tag */}
          <div className="animate-fade-in">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm">
              Creative Platform
            </span>
          </div>

          {/* Main headline */}
          <div className="space-y-6 max-w-5xl animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h1 className="font-display text-7xl md:text-8xl lg:text-9xl font-black text-foreground leading-[0.9] tracking-tight">
              Build
              <br />
              Share
              <br />
              Create
            </h1>
            <p className="text-lg md:text-xl text-muted/80 max-w-2xl leading-relaxed">
              A premium platform for creators to build worlds, share projects, and build communities. Premium dark aesthetic meets cutting-edge digital creative tools.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button href="/explore">
              Explore Now
            </Button>
            <Button href="/projects" variant="secondary">
              View Projects
            </Button>
          </div>

          {/* Stats hint */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center md:text-left animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div>
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-xs text-muted mt-1">Creators</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-xs text-muted mt-1">Core Sections</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-muted mt-1">Open Platform</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== FEATURED SECTIONS ===== */}
      <section className="relative py-24 md:py-40 border-b border-white/10">
        <Container className="space-y-16">
          {/* Section header */}
          <div className="max-w-2xl space-y-4 animate-slide-up">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
              Platform Features
            </p>
            <h2 className="font-display text-6xl md:text-7xl font-black text-foreground leading-[1]">
              Everything you need
            </h2>
          </div>

          {/* 2x2 Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((section, idx) => (
              <Link
                key={section.href}
                href={section.href}
                className="group block animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Card className="h-full flex flex-col p-8 bg-surface-light/30 hover:bg-surface-light/50 cursor-pointer">
                  <div className="mb-6">
                    {idx === 0 && <IconWorld />}
                    {idx === 1 && <IconProject />}
                    {idx === 2 && <IconForum />}
                    {idx === 3 && <IconShop />}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:text-white transition-colors duration-300 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted/70 group-hover:text-muted/90 transition-colors duration-300 flex-1">
                    {section.description}
                  </p>
                  <div className="mt-6 text-white/0 group-hover:text-white/40 transition-all duration-300 text-sm font-semibold">
                    Explore →
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== CTA SECTION - Final Call ===== */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15 blur-3xl bg-gradient-to-b from-white to-transparent" />
        </div>

        <Container className="relative">
          <div className="max-w-3xl space-y-8 animate-slide-up">
            <h2 className="font-display text-6xl md:text-7xl font-black text-foreground">
              Ready to create something extraordinary?
            </h2>
            <p className="text-lg text-muted/80 max-w-2xl">
              Join a community of creators building the future of digital creative platforms. No limitations, no restrictions—just pure creative potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/explore">Start Exploring</Button>
              <Button href="/projects" variant="secondary">Browse Projects</Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
