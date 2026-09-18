import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export default function ExplorePage() {
  return (
    <Container className="py-20">
      <PageHeader
        eyebrow="Discovery"
        title="Explore"
        description="Discover projects, worlds, stories and communities. Everything happening on Zetraxus."
      />

      {/* Search & Filter section */}
      <div className="mt-16 grid gap-5 md:grid-cols-3 mb-16">
        {/* Search */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search projects, worlds, stories..."
            disabled
            className="w-full px-4 py-3 border border-border/70 bg-surface/50 backdrop-blur-sm text-foreground placeholder-muted/50 text-sm disabled:opacity-40 disabled:cursor-not-allowed rounded-[var(--radius-md)] transition-colors"
          />
          <p className="text-xs text-faint mt-2">Search coming soon</p>
        </div>

        {/* Category filter */}
        <div>
          <select
            disabled
            className="w-full px-4 py-3 border border-border/70 bg-surface/50 backdrop-blur-sm text-foreground text-sm disabled:opacity-40 disabled:cursor-not-allowed appearance-none rounded-[var(--radius-md)] transition-colors"
          >
            <option>All Categories</option>
          </select>
          <p className="text-xs text-faint mt-2">Filters coming soon</p>
        </div>
      </div>

      {/* Tabs placeholder */}
      <div className="flex gap-10 border-b border-border/60 mb-16 pb-4">
        {["Featured", "Trending", "Latest"].map((tab) => (
          <button
            key={tab}
            disabled
            className="text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-40 transition-colors duration-300 relative group"
          >
            {tab}
            <span className="absolute -bottom-3 left-0 w-0 h-px bg-accent group-disabled:w-0 transition-all duration-300" />
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="mt-10">
        <EmptyState
          title="Nothing published yet"
          description="Once creators publish projects, worlds, stories and discussions, they'll appear here sorted by featured, trending and latest activity."
        />
      </div>

      {/* Mock layout structure for future */}
      <div className="mt-16">
        <h3 className="font-display text-xl font-medium text-foreground mb-6">
          Coming soon: Featured content
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted">Featured {i}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
