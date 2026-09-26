import type { CSSProperties } from "react";

interface SplitTextProps {
  text: string;
  /** Delay before the first character, ms. */
  delay?: number;
  /** Stagger between characters, ms. */
  stagger?: number;
}

/**
 * Renders text as individually animated characters that rise out of a blur
 * on load (`.zx-char` in globals.css). The parent keeps its own hover
 * letter-spacing effects because spacing still applies between spans.
 * Screen readers get the plain string.
 */
export function SplitText({ text, delay = 150, stagger = 45 }: SplitTextProps) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="zx-char"
            style={{ animationDelay: `${delay + index * stagger}ms` } as CSSProperties}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </>
  );
}
