import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-4 py-10 text-sm text-faint md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Zetraxus</p>
        <p>Foundation build — features arrive in stages.</p>
      </Container>
    </footer>
  );
}
