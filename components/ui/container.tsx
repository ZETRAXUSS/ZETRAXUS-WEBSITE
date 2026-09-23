import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Narrow container for text-heavy content (forum threads, articles). */
  narrow?: boolean;
}

/**
 * Horizontal rhythm keeper. Every page section should sit inside a
 * Container so the platform reads as one consistent column width as
 * new sections (forum, shop, worlds) are added.
 */
export function Container({ children, className, narrow = false }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-10",
        narrow ? "max-w-[46rem]" : "max-w-[72rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
