import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ShopPage() {
  const categories = [
    { name: "Books", icon: "📚" },
    { name: "Digital Books", icon: "📖" },
    { name: "3D Prints", icon: "🖨️" },
    { name: "Services", icon: "✨" },
  ];

  return (
    <Container className="py-16">
      <PageHeader
        eyebrow="Marketplace"
        title="Shop"
        description="Physical and digital goods made by creators. Support fellow artists and writers."
      />

      {/* Category buttons */}
      <div className="mt-12 grid gap-4 grid-cols-2 md:grid-cols-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.name}
            disabled
            className="border border-border bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed p-6 text-center transition-colors group"
          >
            <p className="text-2xl mb-2">{cat.icon}</p>
            <p className="text-sm font-medium text-foreground">
              {cat.name}
            </p>
          </button>
        ))}
      </div>

      {/* Filter & sort */}
      <div className="grid gap-4 md:grid-cols-3 mb-12">
        <input
          type="text"
          placeholder="Search shop..."
          disabled
          className="md:col-span-2 px-4 py-3 border border-border bg-surface text-foreground placeholder-faint text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <select
          disabled
          className="px-4 py-3 border border-border bg-surface text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          <option>Sort by</option>
        </select>
      </div>

      {/* Products grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="group cursor-pointer overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-surface-hover to-background mb-4 flex items-center justify-center">
              <span className="text-xs text-faint">Product {i}</span>
            </div>
            <div>
              <h3 className="font-display text-lg font-medium text-foreground group-hover:text-accent transition-colors">
                Product Name
              </h3>
              <p className="text-sm text-muted mt-2">Creator Name</p>
              <div className="flex items-baseline justify-between mt-4">
                <p className="text-lg font-medium text-foreground">$0.00</p>
                <p className="text-xs text-accent">Out of stock</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      <div className="mt-16">
        <EmptyState
          title="Shop coming soon"
          description="Checkout, payments, orders and digital delivery are being built. Creators will be able to list books, digital products, 3D prints and services here."
          action={
            <Button variant="secondary" disabled>
              List a product — coming soon
            </Button>
          }
        />
      </div>
    </Container>
  );
}
