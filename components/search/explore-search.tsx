"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { timeAgo } from "@/lib/i18n/translate";
import { EMPTY_RESULTS, pushRecentSearch, searchSite, type SearchResults } from "@/lib/search";
import { Avatar } from "@/components/ui/avatar";
import { ArrowRightIcon, ChatIcon, CloseIcon, HashIcon, SearchIcon } from "@/components/ui/icons";
import { markdownExcerpt } from "@/components/forum/markdown";

/** Big inline search for the Explore page, with live results below it. */
export function ExploreSearch() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      const data = await searchSite(q, 8);
      if (id === requestId.current) {
        setResults(data);
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const q = query.trim();
  const total = results.threads.length + results.users.length + results.categories.length;

  return (
    <div>
      <div className="group/search relative">
        <SearchIcon
          size={18}
          className={`pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-500 ${
            loading ? "scale-110 text-white" : "text-white/30 group-focus-within/search:text-white/70"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && pushRecentSearch(query)}
          placeholder={t("explore.searchPlaceholder")}
          className="w-full rounded-full border border-white/[0.12] bg-white/[0.025] py-4 pl-14 pr-14 text-sm text-white placeholder-white/25 outline-none transition-all duration-500 focus:border-white/30 focus:bg-white/[0.04] focus:shadow-[0_0_0_6px_rgba(255,255,255,0.03),0_0_40px_rgba(255,255,255,0.06)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("common.clear")}
            className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"
          >
            <CloseIcon size={13} />
          </button>
        )}
        {loading && (
          <span className="absolute inset-x-10 bottom-0 overflow-hidden">
            <span className="zx-scanline" />
          </span>
        )}
      </div>

      {q.length >= 2 && !loading && (
        <div className="zx-rise-in mt-6">
          {total === 0 ? (
            <p className="rounded-[20px] border border-dashed border-white/[0.1] px-6 py-10 text-center text-sm text-white/35">
              {t("search.noResults", { query: q })}
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("search.discussions")}</p>
                {results.threads.length === 0 && <p className="text-[12px] text-white/25">—</p>}
                {results.threads.map((thread, index) => (
                  <Link
                    key={thread.id}
                    href={`/forum/${thread.id}`}
                    data-spotlight
                    className="zx-rise-in group relative flex items-start gap-4 overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#070707] px-5 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/20"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <span className="relative z-[3] flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.1] text-white/45">
                      <ChatIcon size={14} />
                    </span>
                    <span className="relative z-[3] min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-white/85 group-hover:text-white">{thread.title}</span>
                      <span className="mt-1 block line-clamp-1 text-[12px] text-white/35">{markdownExcerpt(thread.excerpt, 140)}</span>
                      <span className="mt-1.5 block text-[10px] uppercase tracking-[1.5px] text-white/20">
                        {(lang === "tr" && thread.category_name_tr) || thread.category_name} · {thread.author_name} · {timeAgo(lang, thread.created_at)}
                      </span>
                    </span>
                    <ArrowRightIcon size={14} className="relative z-[3] mt-2 shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("search.creators")}</p>
                  {results.users.length === 0 && <p className="text-[12px] text-white/25">—</p>}
                  {results.users.map((user, index) => (
                    <Link
                      key={user.id}
                      href={`/forum?author=${encodeURIComponent(user.username)}`}
                      className="zx-rise-in group flex items-center gap-3 rounded-[16px] border border-white/[0.08] bg-[#070707] px-4 py-3 transition-all hover:border-white/20"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <Avatar name={user.display_name} src={user.avatar_url} size={34} ring />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-white/80 group-hover:text-white">{user.display_name}</span>
                        <span className="block truncate text-[11px] text-white/30">@{user.username}</span>
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("search.categories")}</p>
                  {results.categories.length === 0 && <p className="text-[12px] text-white/25">—</p>}
                  {results.categories.map((category, index) => (
                    <Link
                      key={category.id}
                      href={`/forum?category=${category.slug}`}
                      className="zx-rise-in group flex items-center gap-3 rounded-[16px] border border-white/[0.08] bg-[#070707] px-4 py-3 transition-all hover:border-white/20"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/[0.1] text-white/45">
                        <HashIcon size={13} />
                      </span>
                      <span className="text-[13px] font-medium text-white/80 group-hover:text-white">
                        {(lang === "tr" && category.name_tr) || category.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
