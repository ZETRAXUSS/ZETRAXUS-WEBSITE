export const LANGS = ["en", "tr"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "zx-lang";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "tr";
}

/** Pick a language from an Accept-Language header. */
export function langFromAcceptHeader(header: string | null | undefined): Lang {
  if (!header) return DEFAULT_LANG;
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("tr") ? "tr" : DEFAULT_LANG;
}
