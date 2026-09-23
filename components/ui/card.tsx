import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Flat, bordered surface. Deliberately square-cornered and shadowless —
 * hierarchy comes from the hairline border and surface color, not from
 * drop shadows or rounded-everything treatment.
 *
 * Uses subtle white glow on hover for premium feel.
 */
export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={cn(
        "border border-white/10 bg-surface-light/40 backdrop-blur-md p-6 rounded-[var(--radius-lg)] glow-border group transition-all duration-300 hover:bg-surface-light/60 hover:border-white/20",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
