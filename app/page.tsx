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
    <div className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl border-b border-border pb-16">
          <h1 className="font-display text-5xl font-medium leading-[1.05] text-foreground md:text-6xl">
            A place to build, share and sell what you make.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Zetraxus brings projects, worlds and communities into one
            platform. This is the foundation — the systems that will run on
            top of it are still being built.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/explore">Explore Zetraxus</Button>
            <Button href="/projects" variant="secondary">
              View projects
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="group bg-background">
              <Card className="h-full border-0 bg-background transition-colors group-hover:bg-surface">
                <p className="font-display text-xl text-foreground">{section.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {section.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
