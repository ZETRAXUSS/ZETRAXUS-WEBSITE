import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

/**
 * Placeholder for a section whose backend doesn't exist yet. States
 * plainly what isn't here and why, rather than faking content or
 * interaction — swap this out page by page as each system ships.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-border-strong px-8 py-16">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action}
    </div>
  );
}
