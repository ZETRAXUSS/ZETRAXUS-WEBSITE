import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export default function ExplorePage() {
  return (
    <Container className="py-16">
      <PageHeader
        eyebrow="Discovery"
        title="Explore"
        description="Discover projects, worlds, stories and communities. Everything happening on Zetraxus."
      />

      {/* Search & Filter section */}
      <div className="mt-12 grid gap-6 md:grid-cols-3 mb-12">
        {/* Search */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search projects, worlds, stories..."
            disabled
            className="w-full px-4 py-3 border border-border bg-surface text-foreground placeholder-faint text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-faint mt-2">Search coming soon</p>
        </div>

        {/* Category filter */}
        <div>
          <select
            disabled
            className="w-full px-4 py-3 border border-border bg-surface text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
          >
            <option>All Categories</option>
          </select>
          <p className="text-xs text-faint mt-2">Filters coming soon</p>
        </div>
      </div>

      {/* Tabs placeholder */}
      <div className="flex gap-8 border-b border-border mb-12">
        {["Featured", "Trending", "Latest"].map((tab) => (
          <button
            key={tab}
            disabled
            className="pb-4 text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tab}
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
