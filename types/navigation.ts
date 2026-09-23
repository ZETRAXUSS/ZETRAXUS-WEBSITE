/**
 * Shared navigation types.
 *
 * Kept separate from the data in lib/navigation.ts so future features
 * (auth-gated items, role-based visibility, dynamic badges) can extend
 * these shapes without touching the components that consume them.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface CreateAction {
  label: string;
  description: string;
  /** Not yet implemented — every action is disabled until its system ships. */
  comingSoon: true;
}
