import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <Container className="py-16">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your workspace, your projects, and your presence on Zetraxus."
      />

      {/* Profile header (demo) */}
      <div className="mt-12 border-b border-border pb-12">
        <div className="flex items-end gap-6 mb-6">
          <div className="w-24 h-24 border border-border bg-surface-hover flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Your Name
            </h1>
            <p className="text-sm text-muted mt-2">@username</p>
          </div>
        </div>
        <p className="text-base text-muted mb-6 max-w-2xl">
          Your bio goes here. Tell other creators about yourself and what you make.
        </p>
        <div className="flex gap-3">
          <Button disabled>Edit profile</Button>
          <Button variant="secondary" disabled>Settings</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-12 grid gap-4 grid-cols-3 md:grid-cols-6 mb-12">
        {[
          { label: "Projects", value: "0" },
          { label: "Worlds", value: "0" },
          { label: "Followers", value: "0" },
          { label: "Following", value: "0" },
          { label: "Posts", value: "0" },
          { label: "Shop Items", value: "0" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center py-4 px-3">
            <p className="text-2xl font-medium text-foreground">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {/* Projects */}
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Your Projects
          </h2>
          <EmptyState
            title="No projects yet"
            description="Once your account is set up, you'll be able to create and manage projects here."
            action={<Button variant="secondary" disabled>New project</Button>}
          />
        </div>

        {/* Activity */}
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Recent Activity
          </h2>
          <EmptyState
            title="No activity yet"
            description="Once you start creating and engaging, your activity will show here."
          />
        </div>

        {/* Favorites */}
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Saved & Favorites
          </h2>
          <EmptyState
            title="Nothing saved yet"
            description="Bookmark projects, worlds and discussions that inspire you."
          />
        </div>
      </div>

      {/* Sign in notice */}
      <div className="mt-16">
        <EmptyState
          title="Sign in to see your profile"
          description="Authentication isn't available yet. Once accounts ship, you'll see your personalized dashboard here with all your projects, activity and settings."
        />
      </div>
    </Container>
  );
}
