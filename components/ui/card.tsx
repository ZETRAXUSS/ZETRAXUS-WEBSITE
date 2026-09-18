import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Flat, bordered surface. Deliberately square-cornered and shadowless —
 * hierarchy comes from the hairline border and surface color, not from
 * drop shadows or rounded-everything treatment.
 *
 * Uses subtle white glow on hover for premium feel.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "border border-border/70 bg-surface/50 backdrop-blur-sm p-6 glow-hover rounded-[var(--radius-md)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
