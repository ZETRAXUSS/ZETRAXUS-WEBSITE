import type { TranslationKey } from "@/lib/i18n/translate";
import type { CreationKind } from "./types";

/**
 * Shared definition of the world / lore / character forms.
 * The edge function (`post-content`) enforces the same keys and limits.
 */

export interface TextSection {
  key: string;
  label: TranslationKey;
  hint: TranslationKey;
  max: number;
  rows: number;
  required?: boolean;
  /** Markdown editor (with formatting) instead of a plain textarea. */
  rich?: boolean;
}

export interface ShortField {
  key: string;
  label: TranslationKey;
  max: number;
  placeholder?: TranslationKey;
}

export const WORLD_TYPES = [
  "fantasy",
  "high_fantasy",
  "dark_fantasy",
  "scifi",
  "space_opera",
  "cyberpunk",
  "steampunk",
  "post_apocalyptic",
  "mythological",
  "historical",
  "modern",
  "horror",
] as const;

export const WORLD_SCALES = ["universe", "galaxy", "planet", "continent", "region", "city", "plane"] as const;

export const LORE_TYPES = ["legend", "myth", "chronicle", "history", "prophecy", "tale", "record", "religion"] as const;

export const CHARACTER_ROLES = [
  "protagonist",
  "antagonist",
  "deuteragonist",
  "anti_hero",
  "mentor",
  "villain",
  "supporting",
  "side",
] as const;

export const PROJECT_GENRES = [
  "fantasy",
  "scifi",
  "horror",
  "mystery",
  "romance",
  "adventure",
  "historical",
  "comedy",
  "drama",
  "game",
  "comic",
  "animation",
] as const;

export const CITY_KINDS = ["capital", "city", "town", "village", "fortress", "port", "ruin", "station"] as const;

export const WORLD_SECTIONS: TextSection[] = [
  { key: "overview", label: "world.overview", hint: "world.overviewHint", max: 8000, rows: 6, required: true, rich: true },
  { key: "geography", label: "world.geography", hint: "world.geographyHint", max: 8000, rows: 5, rich: true },
  { key: "climate", label: "world.climate", hint: "world.climateHint", max: 4000, rows: 3 },
  { key: "races", label: "world.races", hint: "world.racesHint", max: 6000, rows: 4, rich: true },
  { key: "systems", label: "world.systems", hint: "world.systemsHint", max: 8000, rows: 5, rich: true },
  { key: "religions", label: "world.religions", hint: "world.religionsHint", max: 6000, rows: 4, rich: true },
  { key: "economy", label: "world.economy", hint: "world.economyHint", max: 4000, rows: 3 },
  { key: "history", label: "world.history", hint: "world.historyHint", max: 12000, rows: 6, rich: true },
  { key: "conflicts", label: "world.conflicts", hint: "world.conflictsHint", max: 6000, rows: 4, rich: true },
];

export const LORE_SECTIONS: TextSection[] = [
  { key: "summary", label: "lore.summary", hint: "lore.summaryHint", max: 500, rows: 2 },
  { key: "body", label: "lore.body", hint: "lore.bodyHint", max: 20000, rows: 14, required: true, rich: true },
];

export const CHARACTER_SHORT: ShortField[] = [
  { key: "age", label: "character.age", max: 40, placeholder: "character.agePh" },
  { key: "species", label: "character.species", max: 60, placeholder: "character.speciesPh" },
  { key: "gender", label: "character.gender", max: 40 },
  { key: "height", label: "character.height", max: 40, placeholder: "character.heightPh" },
  { key: "affiliation", label: "character.affiliation", max: 120, placeholder: "character.affiliationPh" },
];

export const CHARACTER_SECTIONS: TextSection[] = [
  { key: "appearance", label: "character.appearance", hint: "character.appearanceHint", max: 6000, rows: 5, required: true, rich: true },
  { key: "personality", label: "character.personality", hint: "character.personalityHint", max: 6000, rows: 5, required: true, rich: true },
  { key: "strengths", label: "character.strengths", hint: "character.strengthsHint", max: 2000, rows: 3 },
  { key: "weaknesses", label: "character.weaknesses", hint: "character.weaknessesHint", max: 2000, rows: 3 },
  { key: "backstory", label: "character.backstory", hint: "character.backstoryHint", max: 12000, rows: 6, rich: true },
  { key: "abilities", label: "character.abilities", hint: "character.abilitiesHint", max: 6000, rows: 4, rich: true },
  { key: "relationships", label: "character.relationships", hint: "character.relationshipsHint", max: 4000, rows: 3, rich: true },
];

export const SECTIONS: Record<CreationKind, TextSection[]> = {
  world: WORLD_SECTIONS,
  lore: LORE_SECTIONS,
  character: CHARACTER_SECTIONS,
};

/* ------------------------------------------------------------------ */
/* MBTI                                                                */
/* ------------------------------------------------------------------ */

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export function mbtiGroup(type: string): TranslationKey {
  const core = type.slice(0, 4);
  if (core[1] === "N" && core[2] === "T") return "mbti.group.analysts";
  if (core[1] === "N" && core[2] === "F") return "mbti.group.diplomats";
  if (core[1] === "S" && core[3] === "J") return "mbti.group.sentinels";
  return "mbti.group.explorers";
}

export const MBTI_AXES: { letters: [string, string]; labels: [TranslationKey, TranslationKey] }[] = [
  { letters: ["E", "I"], labels: ["mbti.E", "mbti.I"] },
  { letters: ["S", "N"], labels: ["mbti.S", "mbti.N"] },
  { letters: ["T", "F"], labels: ["mbti.T", "mbti.F"] },
  { letters: ["J", "P"], labels: ["mbti.J", "mbti.P"] },
];

export function isValidMbti(value: string) {
  return /^[EI][NS][TF][JP](-[AT])?$/.test(value.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Links are banned in the projects area                               */
/* (mirror of the server check — the server is authoritative)          */
/* ------------------------------------------------------------------ */

const TLDS =
  "com|net|org|io|gg|tv|me|co|xyz|app|dev|ly|link|site|online|store|shop|info|biz|ru|tr|de|uk|us|fr|es|it|nl|pl|cc|to|sh|ai|gl|be|club|live|fun|top|pro|page|blog|click|space|website|tk|ml|ga|cf|gq|am|fm|eu|in|br|jp|cn|kr";

const LINK_PATTERNS = [
  /\b(?:https?|ftp):\/\//i,
  /\bwww\s*\./i,
  new RegExp(
    `\\b[a-z0-9][a-z0-9-]{0,62}(?:\\.|\\s*\\[\\s*\\.\\s*\\]\\s*|\\s*\\(\\s*\\.\\s*\\)\\s*|\\s*\\[dot\\]\\s*|\\s*\\(dot\\)\\s*)(?:${TLDS})(?![a-z0-9-])`,
    "i",
  ),
  /\bdiscord(?:app)?\s*\.\s*(?:gg|com)\b/i,
  /\bt\.me\//i,
  /\[[^\]]*\]\([^)]*\)/,
];

export const MEDIA_PREFIX = `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eicbvvrayoubpbkuttmi.supabase.co").trim()}/storage/v1/object/public/media/`;

function stripOwnImages(text: string) {
  const escaped = MEDIA_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`!\\[[^\\]]*\\]\\(${escaped}[^)\\s]+\\)`, "g"), " ");
}

export function containsLink(text: string) {
  const clean = stripOwnImages(text);
  return LINK_PATTERNS.some((pattern) => pattern.test(clean));
}
