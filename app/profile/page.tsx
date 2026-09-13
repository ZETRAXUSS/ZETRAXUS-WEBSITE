import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProfilePage() {
  return (
    <Container className="py-16">
      <PageHeader
        title="Profile"
        description="Your account, your projects and what you've published on Zetraxus."
      />
      <div className="mt-10">
        <EmptyState
          title="Sign in isn't available yet"
          description="Profiles depend on accounts, which haven't been built yet. This page will show your activity, projects and settings once authentication ships."
        />
      </div>
    </Container>
  );
}
