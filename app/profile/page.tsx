import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const stats = [
    { label: "Projects", value: "—" },
    { label: "Followers", value: "—" },
    { label: "Following", value: "—" },
    { label: "Worlds", value: "—" },
    { label: "Posts", value: "—" },
    { label: "Shop Items", value: "—" },
  ];

  return (
    <div className="relative">
      {/* Hero / Profile Header */}
      <section className="relative py-20 md:py-32 border-b border-white/10">
        <Container>
          <div className="space-y-8">
            {/* Avatar & Bio */}
            <div className="flex gap-8 items-start animate-slide-up">
              <div className="w-24 h-24 rounded-[var(--radius-lg)] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-5xl flex-shrink-0">
                👤
              </div>

              <div className="flex-1 space-y-4">
                <h1 className="font-display text-5xl md:text-6xl font-black text-foreground leading-tight">
                  Creator Name
                </h1>
                <p className="text-lg text-muted/80">@username</p>
                <p className="text-foreground/80 leading-relaxed max-w-2xl">
                  Passionate creator building worlds, crafting stories, and designing experiences. Welcome to my creative space where imagination meets technology.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <Button disabled>Edit Profile</Button>
              <Button variant="secondary" disabled>Settings</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Grid */}
      <section className="relative py-16 md:py-20 border-b border-white/10">
        <Container>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {stats.map((stat, idx) => (
              <Card
                key={idx}
                className="animate-scale-in text-center p-6"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-muted/60 mt-2 uppercase tracking-wide font-semibold">
                  {stat.label}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Content Sections */}
      <section className="relative py-20 md:py-32">
        <Container className="space-y-24">
          {/* Projects Section */}
          <div className="space-y-8">
            <div className="space-y-3 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
                Portfolio
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-black text-foreground">
                Your Projects
              </h2>
              <p className="text-lg text-muted/80">Create and manage your creative projects. Coming soon.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, idx) => (
                <Card
                  key={idx}
                  className="animate-scale-in aspect-video flex items-center justify-center text-faint"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="text-center">
                    <p className="text-lg">No projects yet</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity Section */}
          <div className="space-y-8">
            <div className="space-y-3 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
                Activity
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-black text-foreground">
                Recent Activity
              </h2>
              <p className="text-lg text-muted/80">Your activity will appear here once you start creating.</p>
            </div>
            <Card className="animate-scale-in p-8 text-center">
              <p className="text-faint">No activity yet</p>
            </Card>
          </div>

          {/* Saved / Favorites */}
          <div className="space-y-8">
            <div className="space-y-3 animate-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white border border-white/20 px-4 py-2 rounded-full bg-white/5 inline-block">
                Saved
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-black text-foreground">
                Bookmarks & Favorites
              </h2>
              <p className="text-lg text-muted/80">Save projects and content you love for quick access.</p>
            </div>
            <Card className="animate-scale-in p-8 text-center">
              <p className="text-faint">No saved items yet</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Sign In CTA */}
      <section className="relative py-20 md:py-32 border-t border-white/10">
        <Container className="space-y-8 text-center animate-slide-up">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-5xl md:text-6xl font-black text-foreground">
              Sign in to customize
            </h2>
            <p className="text-lg text-muted/80">
              Create your account to build your portfolio, share projects, and connect with the creative community.
            </p>
          </div>
          <Button disabled>Sign In — Coming Soon</Button>
        </Container>
      </section>
    </div>
  );
}
