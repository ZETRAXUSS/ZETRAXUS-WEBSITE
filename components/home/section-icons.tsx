/**
 * Line icons for the homepage section cards. Kept stroke-based and
 * single-weight (1.4) to match the header's search icon rather than the
 * flat emoji glyphs used as placeholders elsewhere in the app.
 */

const shared = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ExploreIcon() {
  return (
    <svg {...shared}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9s1.2-6.4 3.6-9Z" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function ProjectIcon() {
  return (
    <svg {...shared}>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="M4 7.5 12 12l8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

export function ForumIcon() {
  return (
    <svg {...shared}>
      <path d="M4 5.5h16v10H9.5L5 19v-3.5H4v-10Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

export function ShopIcon() {
  return (
    <svg {...shared}>
      <path d="M5 8.5h14l-1.1 10.2a1.5 1.5 0 0 1-1.5 1.3H7.6a1.5 1.5 0 0 1-1.5-1.3L5 8.5Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}
