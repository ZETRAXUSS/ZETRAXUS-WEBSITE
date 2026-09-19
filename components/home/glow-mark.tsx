import { cn } from "@/lib/utils";

interface GlowMarkProps {
  className?: string;
  size?: number;
}

/**
 * The four-point sigil used as Zetraxus's mark. Rendered once as a soft
 * blurred glow and once crisp on top, so it reads as a light source rather
 * than a flat icon.
 */
export function GlowMark({ className, size = 56 }: GlowMarkProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="absolute inset-0 opacity-70 blur-xl"
        style={{ width: size, height: size }}
      >
        <path
          d="M12 0C12 6.5 17.5 12 24 12C17.5 12 12 17.5 12 24C12 17.5 6.5 12 0 12C6.5 12 12 6.5 12 0Z"
          fill="white"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative"
        style={{ width: size, height: size }}
      >
        <path
          d="M12 0C12 6.5 17.5 12 24 12C17.5 12 12 17.5 12 24C12 17.5 6.5 12 0 12C6.5 12 12 6.5 12 0Z"
          fill="white"
        />
        <path
          d="M19 1.5C19 3.5 20.5 5 22.5 5C20.5 5 19 6.5 19 8.5C19 6.5 17.5 5 15.5 5C17.5 5 19 3.5 19 1.5Z"
          fill="white"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
