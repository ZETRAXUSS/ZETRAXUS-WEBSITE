import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ForumPage() {
  const categories = [
    { name: "General", description: "Welcome, introductions, off-topic" },
    { name: "Projects", description: "Discuss and showcase projects" },
    { name: "Worlds", description: "Share worldbuilding ideas" },
    { name: "Stories", description: "Creative writing and narratives" },
    { name: "Characters", description: "Character design and development" },
    { name: "Theory", description: "Deeper discussions and analysis" },
  ];

  return (
    <Container className="py-20">
      <PageHeader
        eyebrow="Community"
        title="Forum"
        description="Connect with other creators. Discuss ideas, share work, and build together."
      />

      {/* Categories grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 mb-16">
        {categories.map((cat) => (
          <Card
            key={cat.name}
            className="group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-display text-lg font-medium text-foreground group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted mt-2">{cat.description}</p>
              </div>
              <div className="text-right text-xs text-faint ml-4">
                <p>— threads</p>
                <p>— replies</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent threads section */}
      <div className="mt-16">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-medium text-foreground mb-2">
            Latest Discussions
          </h2>
          <p className="text-sm text-muted">
            No threads yet — forum goes live when accounts ship.
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="group cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground group-hover:text-accent transition-colors">
                    Thread {i}
                  </h4>
                  <p className="text-sm text-muted mt-1">
                    Posted by Creator · General
                  </p>
                </div>
                <div className="text-right text-xs text-faint ml-4">
                  <p>— replies</p>
                  <p>— views</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty state with CTA */}
      <div className="mt-16">
        <EmptyState
          title="Forum opens when accounts launch"
          description="Once authentication and user accounts are ready, you'll be able to start threads, reply, and join discussions across all categories."
          action={
            <Button variant="secondary" disabled>
              Start a discussion — coming soon
            </Button>
          }
        />
      </div>
    </Container>
  );
}
