import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const projects = [
    { title: "Ethereal Worlds", creator: "Cosmic Creator", status: "Active", category: "Worlds" },
    { title: "Character Chronicles", creator: "Art Master", status: "In Progress", category: "Characters" },
    { title: "Narrative Depths", creator: "Story Writer", status: "Active", category: "Stories" },
    { title: "Lore Archive", creator: "Lore Keeper", status: "Active", category: "Lore" },
    { title: "Project Nexus", creator: "Dev Creator", status: "In Progress", category: "Projects" },
    { title: "World Foundation", creator: "Builder Pro", status: "Active", category: "Worlds" },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <PageHeader
            eyebrow="Creator Hub"
            title="Projects"
            description="Explore creative workspaces where artists, writers, and builders showcase their projects. From worlds to characters—see what's being created."
          />
        </Container>
      </section>

      {/* Filter Tabs */}
      <section className="relative py-12 border-b border-white/10">
        <Container>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {["All", "Active", "Worlds", "Stories", "Characters"].map((filter) => (
              <button
                key={filter}
                disabled
                className="whitespace-nowrap px-4 py-2 text-sm font-medium border border-white/10 rounded-full bg-white/3 text-muted hover:text-foreground hover:border-white/20 disabled:opacity-40 transition-all duration-300"
              >
                {filter}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Projects Grid */}
      <section className="relative py-20 md:py-32">
        <Container>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <Card
                key={idx}
                className="group animate-scale-in overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Project Image Area */}
                <div className="aspect-video bg-gradient-to-br from-white/10 via-white/5 to-surface-bright rounded-lg mb-6 flex items-center justify-center group-hover:from-white/15 transition-all duration-300">
                  <span className="text-4xl opacity-50 group-hover:opacity-70 transition-opacity">📦</span>
                </div>

                {/* Project Info */}
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-white transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted/60">
                    {project.creator} · <span className="text-white/40">{project.category}</span>
                  </p>

                  {/* Status badge */}
                  <div className="pt-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      project.status === "Active"
                        ? "border-green-500/30 bg-green-500/10 text-green-300"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 border-t border-white/10">
        <Container className="space-y-8">
          <div className="max-w-2xl space-y-4 animate-slide-up">
            <h2 className="font-display text-5xl md:text-6xl font-black text-foreground">
              Start your project
            </h2>
            <p className="text-lg text-muted/80">
              Create your own creative workspace and share your vision with the community.
            </p>
          </div>
          <Button disabled>Create Project — Coming Soon</Button>
        </Container>
      </section>
    </div>
  );
}
