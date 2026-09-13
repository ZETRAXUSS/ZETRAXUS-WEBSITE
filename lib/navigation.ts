import type { CreateAction, NavItem } from "@/types/navigation";

/**
 * Primary navigation. Each route already exists as a page under app/.
 * Add new top-level sections here — the header and mobile menu both
 * render from this single list.
 */
export const primaryNav: NavItem[] = [
  { label: "Explore", href: "/explore" },
  { label: "Projects", href: "/projects" },
  { label: "Forum", href: "/forum" },
  { label: "Shop", href: "/shop" },
];

/**
 * Actions surfaced under the "Create" menu. Every one of these depends
 * on a system that hasn't been built yet (auth, database, storage).
 * They render as visible, disabled entries so the information
 * architecture is in place before the functionality is.
 */
export const createActions: CreateAction[] = [
  {
    label: "New project",
    description: "Start a project workspace",
    comingSoon: true,
  },
  {
    label: "New world",
    description: "Define a setting for your work",
    comingSoon: true,
  },
  {
    label: "New lore entry",
    description: "Document characters and history",
    comingSoon: true,
  },
  {
    label: "New discussion",
    description: "Start a thread in the forum",
    comingSoon: true,
  },
  {
    label: "Upload to shop",
    description: "List a digital or physical product",
    comingSoon: true,
  },
];
