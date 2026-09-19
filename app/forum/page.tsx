import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForumPage() {
  const categories = [
    { name: "General", description: "Welcome, introductions, off-topic", threads: "—", activity: "—" },
    { name: "Projects", description: "Discuss and showcase creative projects", threads: "—", activity: "—" },
    { name: "Worlds", description: "Share worldbuilding ideas and concepts", threads: "—", activity: "—" },
    { name: "Stories", description: "Creative writing and narrative discussions", threads: "—", activity: "—" },
    { name: "Characters", description: "Character design and development", threads: "—", activity: "—" },
    { name: "Theory", description: "Deep analysis and theoretical discussions", threads: "—", activity: "—" },
  ];

  const recentThreads = [
    { title: "Tips for Starting Your First Project", author: "Creator Pro", replies: 24, views: 156 },
    { title: "Best Practices for World Building", author: "Lore Master", replies: 18, views: 203 },
    { title: "Character Design Techniques", author: "Artist Elite", replies: 31, views: 289 },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <PageHeader
            eyebrow="Community"
            title="Forum"
            description="Connect with creators. Share ideas, get feedback, and build relationships with the community. Foster collaboration and growth."
          />
        </Container>
      </section>

      {/* Categories Section */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <div className="space-y-12">
            <div className="space-y-3 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
                Categories
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black text-foreground">
                Discussion Topics
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {categories.map((cat, idx) => (
                <Card
                  key={idx}
                  className="group animate-scale-in p-6"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-white transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-muted/70 mt-2">
                        {cat.description}
                      </p>
                    </div>
                    <div className="text-right text-xs text-faint ml-4">
                      <p>{cat.threads} threads</p>
                      <p>{cat.activity} replies</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Recent Discussions */}
      <section className="relative py-20 md:py-32">
        <Container>
          <div className="space-y-12">
            <div className="space-y-3 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
                Activity
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black text-foreground">
                Latest Discussions
              </h2>
              <p className="text-lg text-muted/80">Community conversations coming soon.</p>
            </div>

            <div className="space-y-4">
              {recentThreads.map((thread, idx) => (
                <Card
                  key={idx}
                  className="group animate-slide-up p-6"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground group-hover:text-white transition-colors">
                        {thread.title}
                      </h4>
                      <p className="text-sm text-muted/70 mt-2">
                        Posted by {thread.author}
                      </p>
                    </div>
                    <div className="text-right text-xs text-faint ml-4">
                      <p>{thread.replies} replies</p>
                      <p>{thread.views} views</p>
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
              Join the conversation
            </h2>
            <p className="text-lg text-muted/80">
              Start a discussion or reply to ongoing threads. Community engagement coming soon.
            </p>
          </div>
          <Button disabled>Start a Thread — Coming Soon</Button>
        </Container>
      </section>
    </div>
  );
}
