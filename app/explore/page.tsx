import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ExplorePage() {
  return (
    <Container className="py-16">
      <PageHeader
        title="Explore"
        description="A feed of projects, worlds and posts from across Zetraxus. It fills in once creators start publishing."
      />
      <div className="mt-10">
        <EmptyState
          title="Nothing to show yet"
          description="Explore will surface projects, discussions and shop listings as people create them. There's nothing published on the platform yet."
        />
      </div>
    </Container>
  );
}
