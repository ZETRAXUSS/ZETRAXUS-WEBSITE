import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  const categories = ["Projects", "Worlds", "Stories", "Characters", "Communities"];
  const featured = [
    { title: "Featured Realm", desc: "Epic world building in progress" },
    { title: "Character Gallery", desc: "Premium character design showcase" },
    { title: "Story Archive", desc: "Narrative-driven creative works" },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <PageHeader
            eyebrow="Discovery"
            title="Explore"
            description="Discover extraordinary projects, worlds and stories created by the community. Find inspiration and connect with other creators."
          />
        </Container>
      </section>

      {/* Search & Filter Section */}
      <section className="relative py-16 md:py-24 border-b border-white/10">
        <Container>
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Search projects, worlds, stories..."
                disabled
                className="md:col-span-2 px-5 py-4 border border-white/10 bg-surface-light/30 rounded-[var(--radius-md)] text-foreground placeholder-faint/50 text-sm disabled:opacity-40 transition-all duration-300"
              />
              <select
                disabled
                className="px-5 py-4 border border-white/10 bg-surface-light/30 rounded-[var(--radius-md)] text-foreground text-sm disabled:opacity-40 appearance-none"
              >
                <option>All Categories</option>
              </select>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  disabled
                  className="px-4 py-2 text-sm border border-white/10 rounded-full bg-white/3 text-muted hover:text-foreground hover:border-white/20 disabled:opacity-40 transition-all duration-300"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Grid */}
      <section className="relative py-20 md:py-32">
        <Container>
          <div className="space-y-12">
            <div className="space-y-3 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
                Featured
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black text-foreground">
                Community Highlights
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((item, idx) => (
                <Card
                  key={idx}
                  className="group animate-scale-in overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="aspect-video bg-gradient-to-br from-white/10 to-white/5 rounded-lg mb-6 flex items-center justify-center">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted/70 mt-2">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
