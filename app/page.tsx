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
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-white/5 to-transparent blur-3xl rounded-full opacity-20" />
        </div>

        <div className="relative py-24 md:py-40">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm text-accent font-medium mb-4 tracking-wide uppercase">
                Creative Platform
              </p>
              <h1 className="font-display text-5xl md:text-7xl font-medium leading-[1.05] text-foreground mb-6">
                Build, share and sell.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-muted max-w-2xl mb-8">
                Zetraxus is a creative platform for projects, worlds, stories and communities. Bring your vision to life and connect with creators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
      <div className="py-16 md:py-24">
        <Container>
          <div className="mb-16">
            <p className="text-sm text-accent font-medium mb-2">Core Features</p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground">
              Everything in one place
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group bg-background"
              >
                <Card className="h-full border-0 bg-background transition-colors group-hover:bg-surface">
                  <p className="font-display text-xl font-medium text-foreground">
                    {section.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
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
