import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-sm mt-32">
      <Container className="flex flex-col gap-10 py-16 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4 max-w-xs">
          <p className="font-display text-sm font-bold text-foreground tracking-wide">ZETRAXUS</p>
          <p className="text-xs text-faint leading-relaxed">
            A creative platform for building, sharing, and selling with your community.
          </p>
          <p className="text-xs text-faint">© {new Date().getFullYear()} Zetraxus</p>
        </div>
        <div className="flex gap-8 md:gap-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Platform</p>
            <ul className="space-y-2 text-xs text-faint">
              <li><a href="/explore" className="glow-text hover:text-foreground">Explore</a></li>
              <li><a href="/projects" className="glow-text hover:text-foreground">Projects</a></li>
              <li><a href="/forum" className="glow-text hover:text-foreground">Forum</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Community</p>
            <ul className="space-y-2 text-xs text-faint">
              <li><a href="/shop" className="glow-text hover:text-foreground">Shop</a></li>
              <li><a href="/profile" className="glow-text hover:text-foreground">Profile</a></li>
              <li>Status: Foundation</li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
