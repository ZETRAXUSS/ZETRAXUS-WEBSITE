import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  const categories = [
    { name: "Books", icon: "📚", count: "Coming" },
    { name: "Digital", icon: "💿", count: "Coming" },
    { name: "3D Prints", icon: "🖨️", count: "Coming" },
    { name: "Services", icon: "✨", count: "Coming" },
  ];

  const featured = [
    { title: "Premium Template Kit", price: "$29", creator: "Design Studio", category: "Digital" },
    { title: "World Building Guide", price: "$19", creator: "Lore Master", category: "Books" },
    { title: "Character Design Service", price: "$199", creator: "Art Pro", category: "Services" },
    { title: "Miniature Set", price: "$49", creator: "3D Creator", category: "3D Prints" },
    { title: "Story Writing Toolkit", price: "$15", creator: "Writer Elite", category: "Digital" },
    { title: "Asset Pack Vol.1", price: "$39", creator: "Assets Studio", category: "Digital" },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <PageHeader
            eyebrow="Marketplace"
            title="Shop"
            description="Premium digital products, physical goods, and creative services from talented creators. Support artists and buy quality content."
          />
        </Container>
      </section>

      {/* Category Showcase */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Card
                key={idx}
                className="group animate-scale-in p-6 text-center hover:bg-surface-light/60 cursor-pointer"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-foreground group-hover:text-white transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-faint mt-2">{cat.count}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <div className="space-y-12">
            <div className="space-y-3 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
                Featured
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black text-foreground">
                Curated Products
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((product, idx) => (
                <Card
                  key={idx}
                  className="group animate-scale-in overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-white/10 via-white/5 to-surface-bright rounded-lg mb-6 flex items-center justify-center group-hover:from-white/15 transition-all duration-300">
                    <span className="text-5xl opacity-50 group-hover:opacity-70 transition-opacity">
                      {idx % 2 === 0 ? "🎁" : "📦"}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-white transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-muted/60">
                      {product.creator} · <span className="text-white/40">{product.category}</span>
                    </p>

                    {/* Price */}
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xl font-bold text-white">{product.price}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 border-t border-white/10">
        <Container className="space-y-8">
          <div className="max-w-2xl space-y-4 animate-slide-up">
            <h2 className="font-display text-5xl md:text-6xl font-black text-foreground">
              Sell your creations
            </h2>
            <p className="text-lg text-muted/80">
              List your books, digital products, 3D prints or services. Build a sustainable creative business on Zetraxus.
            </p>
          </div>
          <Button disabled>List a Product — Coming Soon</Button>
        </Container>
      </section>
    </div>
  );
}
