import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div>
      {/* Hero section with cinematic depth */}
      <div className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-radial-gradient from-white/8 via-white/2 to-transparent blur-3xl rounded-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />
        </div>

        <div className="relative py-32 md:py-48 lg:py-56">
          <Container>
            <div className="max-w-4xl space-y-8">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                  Creative Platform
                </p>
              </div>
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.95] text-foreground">
                Build, share
                <br />
                and sell.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-muted/90 max-w-3xl">
                Zetraxus is a creative platform for projects, worlds, stories and communities. Bring your vision to life and connect with creators around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button href="/explore">Explore Zetraxus</Button>
                <Button href="/projects" variant="secondary">
                  View Projects
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Sections grid */}
      <div className="py-20 md:py-32">
        <Container>
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold mb-3">Features</p>
            <h2 className="font-display text-5xl md:text-6xl font-medium text-foreground leading-[1.1]">
              Everything in one place
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group"
              >
                <Card className="h-full transition-all duration-300 group-hover:border-accent/30">
                  <p className="font-display text-xl font-medium text-foreground group-hover:text-accent transition-colors duration-300">
                    {section.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted group-hover:text-muted/90 transition-colors duration-300">
                    {section.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </div>

      {/* CTA section */}
      <div className="relative border-t border-border py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-4">
              Ready to create?
            </h2>
            <p className="text-lg text-muted mb-8">
              Join other creators and start building your next project. Everything you need is here.
            </p>
            <Button href="/explore">Get started</Button>
          </div>
        </Container>
      </div>
    </div>
  );
}
