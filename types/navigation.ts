/**
 * Shared navigation types.
 */

import type { TranslationKey } from "@/lib/i18n/translate";

export interface NavItem {
  labelKey: TranslationKey;
  href: string;
}
