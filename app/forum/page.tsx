import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function ForumPage() {
  return (
    <Container className="py-16">
      <PageHeader
        title="Forum"
        description="Discussions between creators and communities, organized by project and topic."
      />
      <div className="mt-10">
        <EmptyState
          title="No discussions yet"
          description="The forum opens once accounts and posting are in place. Threads, replies and moderation will live here."
          action={
            <Button variant="secondary" disabled>
              New discussion — coming soon
            </Button>
          }
        />
      </div>
    </Container>
  );
}
