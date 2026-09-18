import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur">
      <Container className="flex flex-col gap-6 py-12 text-xs text-faint md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-medium text-foreground/70">Zetraxus</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
        <p className="max-w-sm text-foreground/60">Foundation build — features arrive in stages.</p>
      </Container>
    </footer>
  );
}
