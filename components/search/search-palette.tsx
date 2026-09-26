"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import {
  EMPTY_RESULTS,
  SITE_PAGES,
  clearRecentSearches,
  getRecentSearches,
  matchPages,
  pushRecentSearch,
  searchSite,
  type SearchResults,
} from "@/lib/search";
import { playSound } from "@/lib/sound/engine";
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowRightIcon,
  ChatIcon,
  CloseIcon,
  HashIcon,
  SearchIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { timeAgo } from "@/lib/i18n/translate";

interface PaletteContextValue {
  open: (initialQuery?: string) => void;
  close: () => void;
  isOpen: boolean;
}

const PaletteContext = createContext<PaletteContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function useSearchPalette() {
  return useContext(PaletteContext);
}

export function SearchPaletteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const [initialQuery, setInitialQuery] = useState("");

  const open = useCallback((query?: string) => {
    setInitialQuery(query ?? "");
    setState("open");
    playSound("open");
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  const close = useCallback(() => {
    if (stateRef.current !== "open") return;
    playSound("close");
    setState("closing");
    window.setTimeout(() => setState("closed"), 240);
  }, []);

  // Global shortcuts: Ctrl/⌘ + K anywhere, "/" when not typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (state === "open") close();
        else open();
      } else if (event.key === "/" && !typing && state === "closed") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, state]);

  const value = useMemo(() => ({ open, close, isOpen: state === "open" }), [open, close, state]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {state !== "closed" && (
        <SearchPalette closing={state === "closing"} initialQuery={initialQuery} onClose={close} />
      )}
    </PaletteContext.Provider>
  );
}

type Item =
  | { kind: "page"; href: string; title: string; subtitle: string }
  | { kind: "thread"; href: string; title: string; subtitle: string; meta: string }
  | { kind: "user"; href: string; title: string; subtitle: string; avatar: string | null }
  | { kind: "category"; href: string; title: string; subtitle: string }
  | { kind: "recent"; query: string };

function SearchPalette({
  closing,
  initialQuery,
  onClose,
}: {
  closing: boolean;
  initialQuery: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const requestId = useRef(0);

  useEffect(() => {
    setRecent(getRecentSearches());
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Debounced live search
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
      const data = await searchSite(q, 6);
      if (id === requestId.current) {
        setResults(data);
        setLoading(false);
        setActive(0);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  const items: Item[] = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) {
      const recents: Item[] = recent.map((entry) => ({ kind: "recent", query: entry }));
      const pages: Item[] = SITE_PAGES.slice(0, 6).map((page) => ({
        kind: "page",
        href: page.href,
        title: t(page.title),
        subtitle: t(page.description),
      }));
      return [...recents, ...pages];
    }

    const list: Item[] = [];
    matchPages(q, t).forEach((page) =>
      list.push({ kind: "page", href: page.href, title: t(page.title), subtitle: t(page.description) }),
    );
    results.threads.forEach((thread) =>
      list.push({
        kind: "thread",
        href: `/forum/${thread.id}`,
        title: thread.title,
        subtitle: thread.excerpt.replace(/[#>*_`~\[\]]/g, "").slice(0, 110),
        meta: `${lang === "tr" && thread.category_name_tr ? thread.category_name_tr : thread.category_name} · ${thread.author_name} · ${timeAgo(lang, thread.created_at)}`,
      }),
    );
    results.users.forEach((user) =>
      list.push({
        kind: "user",
        href: `/forum?author=${encodeURIComponent(user.username)}`,
        title: user.display_name,
        subtitle: `@${user.username}`,
        avatar: user.avatar_url,
      }),
    );
    results.categories.forEach((category) =>
      list.push({
        kind: "category",
        href: `/forum?category=${category.slug}`,
        title: lang === "tr" && category.name_tr ? category.name_tr : category.name,
        subtitle: (lang === "tr" && category.description_tr ? category.description_tr : category.description) ?? "",
      }),
    );
    return list;
  }, [query, results, recent, t, lang]);

  useEffect(() => {
    if (active >= items.length) setActive(Math.max(0, items.length - 1));
  }, [items.length, active]);

  // Keep the active row in view
  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    if (item.kind === "recent") {
      setQuery(item.query);
      inputRef.current?.focus();
      return;
    }
    pushRecentSearch(query);
    playSound("click");
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (items.length ? (index + 1) % items.length : 0));
      playSound("hover");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (items.length ? (index - 1 + items.length) % items.length : 0));
      playSound("hover");
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (items[active]) choose(items[active]);
      else if (query.trim().length >= 2) {
        pushRecentSearch(query);
        onClose();
        router.push(`/forum?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (event.key.length === 1) {
      playSound("type");
    }
  };

  const q = query.trim();
  const noResults = q.length >= 2 && !loading && items.length === 0;

  const sections: { label: string; kinds: Item["kind"][] }[] =
    q.length < 2
      ? [
          { label: t("search.recent"), kinds: ["recent"] },
          { label: t("search.quickLinks"), kinds: ["page"] },
        ]
      : [
          { label: t("search.pages"), kinds: ["page"] },
          { label: t("search.discussions"), kinds: ["thread"] },
          { label: t("search.creators"), kinds: ["user"] },
          { label: t("search.categories"), kinds: ["category"] },
        ];

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={t("search.title")}>
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-md ${closing ? "zx-backdrop-out" : "zx-backdrop-in"}`}
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-[9vh] md:pt-[12vh]">
        <div
          className={`pointer-events-auto relative w-full max-w-[700px] overflow-hidden rounded-[26px] border border-white/[0.12] bg-[#070707]/95 shadow-[0_40px_140px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.02)_inset] ${
            closing ? "zx-panel-out" : "zx-panel-in"
          }`}
        >
          {/* ambient light */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[80px]" />

          {/* input row */}
          <div className="relative flex items-center gap-4 border-b border-white/[0.08] px-6 py-5">
            <span className={`text-white/50 transition-transform duration-500 ${loading ? "scale-110 text-white" : ""}`}>
              <SearchIcon size={20} />
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("search.placeholder")}
              className="h-9 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-white/25"
              spellCheck={false}
              autoComplete="off"
              aria-label={t("search.title")}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/35 hover:bg-white/[0.06] hover:text-white"
                aria-label={t("common.clear")}
                data-sound="off"
              >
                <CloseIcon size={14} />
              </button>
            )}
            <kbd className="hidden rounded-md border border-white/[0.12] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-white/35 sm:block">
              ESC
            </kbd>
            {loading && <span className="zx-scanline" />}
          </div>

          {/* results */}
          <div ref={listRef} className="relative max-h-[min(60vh,520px)] overflow-y-auto overscroll-contain px-3 py-3">
            {sections.map((section) => {
              const sectionItems = items
                .map((item, index) => ({ item, index }))
                .filter(({ item }) => section.kinds.includes(item.kind));
              if (!sectionItems.length) return null;

              return (
                <div key={section.label} className="mb-2">
                  <div className="flex items-center justify-between px-3 pb-2 pt-3">
                    <p className="text-[9px] font-medium uppercase tracking-[3px] text-white/25">{section.label}</p>
                    {section.kinds.includes("recent") && (
                      <button
                        type="button"
                        onClick={() => {
                          clearRecentSearches();
                          setRecent([]);
                        }}
                        className="text-[9px] uppercase tracking-[2px] text-white/25 hover:text-white/60"
                      >
                        {t("common.clear")}
                      </button>
                    )}
                  </div>

                  {sectionItems.map(({ item, index }) => {
                    runningIndex += 1;
                    const isActive = index === active;
                    return (
                      <button
                        key={`${item.kind}-${index}`}
                        type="button"
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={() => choose(item)}
                        data-sound="off"
                        data-sound-hover="off"
                        className={`zx-rise-in group relative flex w-full items-center gap-4 rounded-[16px] px-3 py-3 text-left transition-colors duration-200 ${
                          isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        }`}
                        style={{ animationDelay: `${Math.min(runningIndex, 12) * 28}ms` }}
                      >
                        <span
                          className={`absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                            isActive ? "opacity-100" : "scale-y-0 opacity-0"
                          }`}
                        />
                        <ItemIcon item={item} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-white/85 group-hover:text-white">
                            {item.kind === "recent" ? item.query : <Highlight text={item.title} query={q} />}
                          </span>
                          {item.kind !== "recent" && item.subtitle && (
                            <span className="mt-0.5 block truncate text-[11px] text-white/35">
                              <Highlight text={item.subtitle} query={q} />
                            </span>
                          )}
                          {item.kind === "thread" && (
                            <span className="mt-1 block truncate text-[10px] uppercase tracking-[1.5px] text-white/20">
                              {item.meta}
                            </span>
                          )}
                        </span>
                        <span
                          className={`shrink-0 text-white/30 transition-all duration-300 ${
                            isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                          }`}
                        >
                          <ArrowRightIcon size={14} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {loading && items.length === 0 && (
              <div className="space-y-2 px-3 py-3">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex items-center gap-4 py-2">
                    <span className="zx-skeleton h-9 w-9 rounded-[12px]" />
                    <span className="flex-1 space-y-2">
                      <span className="zx-skeleton block h-3 w-2/3 rounded" />
                      <span className="zx-skeleton block h-2.5 w-1/3 rounded" />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {noResults && (
              <div className="zx-rise-in px-6 py-14 text-center">
                <p className="text-sm text-white/50">{t("search.noResults", { query: q })}</p>
                <p className="mt-2 text-[12px] text-white/25">{t("search.noResultsHint")}</p>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-3 text-[10px] text-white/25">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/[0.1] px-1.5 py-0.5 font-mono">↑↓</kbd>
                {t("search.navigate")}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/[0.1] px-1.5 py-0.5 font-mono">↵</kbd>
                {t("search.open")}
              </span>
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <kbd className="rounded border border-white/[0.1] px-1.5 py-0.5 font-mono">Ctrl K</kbd>
              {t("search.toggle")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemIcon({ item }: { item: Item }) {
  const box =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.03] text-white/55";
  switch (item.kind) {
    case "user":
      return <Avatar name={item.title} src={item.avatar} size={36} ring />;
    case "thread":
      return (
        <span className={box}>
          <ChatIcon size={15} />
        </span>
      );
    case "category":
      return (
        <span className={box}>
          <HashIcon size={15} />
        </span>
      );
    case "recent":
      return (
        <span className={box}>
          <SearchIcon size={14} />
        </span>
      );
    default:
      return (
        <span className={box}>
          <SparkIcon size={14} />
        </span>
      );
  }
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[3px] bg-white/15 px-0.5 text-white">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}
