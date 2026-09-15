import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ProjectsPage() {
  return (
    <Container className="py-16">
      <PageHeader
        eyebrow="Creator Hub"
        title="Projects"
        description="Worlds, characters, stories and work in progress. Every creator's workspace, all in one place."
      />

      {/* Filter tabs */}
      <div className="mt-12 flex gap-8 border-b border-border mb-12 overflow-x-auto pb-4">
        {["All", "Active", "Worlds", "Stories", "Characters"].map((filter) => (
          <button
            key={filter}
            disabled
            className="text-sm font-medium text-muted whitespace-nowrap pb-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Projects grid placeholder */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="group cursor-pointer overflow-hidden"
          >
            <div className="aspect-video bg-gradient-to-br from-surface-hover to-background mb-4 flex items-center justify-center">
              <span className="text-xs text-faint">Project {i}</span>
            </div>
            <div>
              <h3 className="font-display text-lg font-medium text-foreground group-hover:text-accent transition-colors">
                Project Title
              </h3>
              <p className="text-sm text-muted mt-2">
                Creator name · Fantasy world
              </p>
              <div className="flex gap-2 mt-4">
                <span className="text-xs px-2 py-1 bg-surface-hover text-muted border border-border rounded-[var(--radius-sm)]">
                  In Progress
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      <div className="mt-16">
        <EmptyState
          title="Projects launching soon"
          description="Creator accounts and project workspaces are coming. Once they ship, you'll be able to browse published projects here and create your own workspace."
          action={
            <Button variant="secondary" disabled>
              Create a project — coming soon
            </Button>
          }
        />
      </div>
    </Container>
  );
}
