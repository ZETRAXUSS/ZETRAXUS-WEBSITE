import type { NavItem } from "@/types/navigation";

/**
 * Primary navigation. The header and mobile menu both render from this
 * single list; labels are translation keys.
 */
export const primaryNav: NavItem[] = [
  { labelKey: "nav.explore", href: "/explore" },
  { labelKey: "nav.projects", href: "/projects" },
  { labelKey: "nav.forum", href: "/forum" },
  { labelKey: "nav.shop", href: "/shop" },
];
