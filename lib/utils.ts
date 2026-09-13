/**
 * Minimal class-name combiner. Kept dependency-free (no clsx / tailwind-merge)
 * since the current component set doesn't need conflict resolution — add
 * a real merge utility only when class conflicts actually start to appear.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
