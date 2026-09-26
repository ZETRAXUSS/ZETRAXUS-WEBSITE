import { db } from "@/lib/supabase/client";
import type { TranslationKey } from "@/lib/i18n/translate";

export interface SearchThread {
  id: string;
  title: string;
  excerpt: string;
  reply_count: number;
  like_count: number;
  created_at: string;
  category_slug: string;
  category_name: string;
  category_name_tr: string | null;
  author_name: string;
  author_username: string;
}

export interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
}

export interface SearchCategory {
  id: string;
  slug: string;
  name: string;
  name_tr: string | null;
  description: string | null;
  description_tr: string | null;
}

export interface SearchProject {
  id: string;
  title: string;
  tagline: string | null;
  status: "in_progress" | "completed";
  cover_url: string | null;
  author_name: string;
}

export interface SearchCreation {
  id: string;
  kind: "world" | "lore" | "character";
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  author_name: string;
}

export interface SearchResults {
  threads: SearchThread[];
  users: SearchUser[];
  categories: SearchCategory[];
  projects: SearchProject[];
  creations: SearchCreation[];
}

export const EMPTY_RESULTS: SearchResults = { threads: [], users: [], categories: [], projects: [], creations: [] };

export async function searchSite(query: string, limit = 6): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) return EMPTY_RESULTS;

  const supabase = db();
  const { data, error } = await supabase.rpc("search_site", { q, lim: limit });
  if (error || !data) return EMPTY_RESULTS;

  const result = data as Partial<SearchResults>;
  return {
    threads: result.threads ?? [],
    users: result.users ?? [],
    categories: result.categories ?? [],
    projects: result.projects ?? [],
    creations: result.creations ?? [],
  };
}

export interface SitePage {
  href: string;
  title: TranslationKey;
  description: TranslationKey;
  keywords: string;
}

/** Static destinations that are always searchable. */
export const SITE_PAGES: SitePage[] = [
  { href: "/", title: "nav.home", description: "search.page.home", keywords: "home ana sayfa zetraxus network" },
  { href: "/explore", title: "nav.explore", description: "search.page.explore", keywords: "explore keşfet discover worlds stories" },
  { href: "/projects", title: "nav.projects", description: "search.page.projects", keywords: "projects projeler workspace creator worlds dünyalar lore characters karakterler" },
  { href: "/forum", title: "nav.forum", description: "search.page.forum", keywords: "forum community topluluk discussion tartışma thread konu" },
  { href: "/shop", title: "nav.shop", description: "search.page.shop", keywords: "shop mağaza market store books digital" },
  { href: "/profile", title: "nav.profile", description: "search.page.profile", keywords: "profile profil account hesap settings ayarlar avatar" },
  { href: "/forum?view=saved", title: "nav.saved", description: "search.page.saved", keywords: "saved kaydedilenler bookmarks yer imi" },
  { href: "/privacy", title: "legal.privacy.title", description: "search.page.privacy", keywords: "privacy gizlilik kvkk data veri cookies çerez" },
  { href: "/terms", title: "legal.terms.title", description: "search.page.terms", keywords: "terms şartlar rules kurallar kullanım" },
  { href: "/create/project", title: "create.project", description: "search.page.newProject", keywords: "new project yeni proje oluştur create" },
  { href: "/create/world", title: "create.world", description: "search.page.newWorld", keywords: "new world yeni dünya harita map planet gezegen" },
];

export function matchPages(query: string, translate: (key: TranslationKey) => string): SitePage[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [];
  return SITE_PAGES.filter((page) => {
    const haystack = `${translate(page.title)} ${translate(page.description)} ${page.keywords}`.toLocaleLowerCase();
    return haystack.includes(q);
  }).slice(0, 4);
}

const RECENT_KEY = "zx-recent-searches";

export function getRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string) {
  const q = query.trim();
  if (q.length < 2) return;
  try {
    const next = [q, ...getRecentSearches().filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearRecentSearches() {
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}
