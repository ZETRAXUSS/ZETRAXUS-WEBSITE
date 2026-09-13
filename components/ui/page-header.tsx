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
    <div className="max-w-2xl border-b border-border pb-10">
      {eyebrow && <p className="mb-3 text-sm text-accent">{eyebrow}</p>}
      <h1 className="font-display text-4xl font-medium text-foreground md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
    </div>
  );
}
