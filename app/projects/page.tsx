import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <Container className="py-16">
      <PageHeader
        title="Projects"
        description="Worlds, characters, lore and work in progress, organized by the people building them."
      />
      <div className="mt-10">
        <EmptyState
          title="No projects yet"
          description="Once accounts and project workspaces exist, creators will be able to publish projects here."
          action={
            <Button variant="secondary" disabled>
              New project — coming soon
            </Button>
          }
        />
      </div>
    </Container>
  );
}
