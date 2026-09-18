interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
}

/**
 * Consistent heading block for section landing pages (Explore, Projects,
 * Forum, Shop, Profile). Keeps typographic rhythm identical across
 * sections so new ones slot in without redesigning the page top.
 */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="max-w-3xl border-b border-border/60 pb-12 space-y-4">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-5xl md:text-6xl font-medium text-foreground leading-[1.1]">
        {title}
      </h1>
      <p className="text-lg leading-relaxed text-muted/90 max-w-2xl">
        {description}
      </p>
    </div>
  );
}
