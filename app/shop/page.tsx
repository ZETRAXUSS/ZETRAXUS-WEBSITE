import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  return (
    <Container className="py-16">
      <PageHeader
        title="Shop"
        description="Digital and physical goods made by the people on Zetraxus."
      />
      <div className="mt-10">
        <EmptyState
          title="No listings yet"
          description="Checkout, orders and digital delivery aren't built yet. Listings will appear here once creators can publish products."
          action={
            <Button variant="secondary" disabled>
              Upload to shop — coming soon
            </Button>
          }
        />
      </div>
    </Container>
  );
}
