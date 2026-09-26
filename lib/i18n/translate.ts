import { en } from "./dictionaries/en";
import { tr } from "./dictionaries/tr";
import type { Lang } from "./config";

export type TranslationKey = keyof typeof en;
export type TranslateVars = Record<string, string | number>;
export type Translate = (key: TranslationKey, vars?: TranslateVars) => string;

const dictionaries: Record<Lang, Record<string, string>> = { en, tr };

export function translate(lang: Lang, key: TranslationKey, vars?: TranslateVars): string {
  const template = dictionaries[lang][key] ?? en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function createTranslator(lang: Lang): Translate {
  return (key, vars) => translate(lang, key, vars);
}

/** "3 minutes ago" style relative time, localised. */
export function timeAgo(lang: Lang, iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "short" });

  if (seconds < 45) return translate(lang, "time.justNow");
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.round(days / 7), "week");

  return new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "short",
    year: days > 330 ? "numeric" : undefined,
  }).format(new Date(iso));
}

export function formatNumber(lang: Lang, value: number): string {
  return new Intl.NumberFormat(lang, { notation: value >= 10000 ? "compact" : "standard" }).format(value);
}
