interface GlowMarkProps {
  size?: number;
  className?: string;
}

/**
 * Hero emblem — white/silver sparkle mark, glowing via a single CSS
 * drop-shadow filter (per spec) rather than a layered blur trick.
 */
export function GlowMark({ size = 64, className }: GlowMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ filter: "drop-shadow(0 0 15px rgba(255,255,255,0.8))" }}
    >
      <path
        d="M12 0C12 6.5 17.5 12 24 12C17.5 12 12 17.5 12 24C12 17.5 6.5 12 0 12C6.5 12 12 6.5 12 0Z"
        fill="white"
      />
    </svg>
  );
}
