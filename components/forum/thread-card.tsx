"use client";

import Link from "next/link";
import type { ThreadSummary } from "@/lib/forum/types";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, timeAgo } from "@/lib/i18n/translate";
import { Avatar } from "@/components/ui/avatar";
import { markdownExcerpt } from "@/components/forum/markdown";
import { BookmarkIcon, ChatIcon, HeartIcon, ImageIcon, LockIcon, PinIcon } from "@/components/ui/icons";

interface ThreadCardProps {
  thread: ThreadSummary;
  index: number;
  saved?: boolean;
  onToggleSave?: (thread: ThreadSummary) => void;
}

export function ThreadCard({ thread, index, saved, onToggleSave }: ThreadCardProps) {
  const { t, lang } = useI18n();
  const imageCount = thread.media?.[0]?.count ?? 0;
  const hot = thread.reply_count >= 10 || thread.like_count >= 15;
  const categoryName =
    lang === "tr" && thread.category?.name_tr ? thread.category.name_tr : thread.category?.name ?? "";

  return (
    <article
      data-spotlight
      className="zx-rise-in group/thread relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#070707] transition-all duration-500 hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-[#0a0a0a] hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <Link href={`/forum/${thread.id}`} className="relative z-[3] flex items-start gap-4 px-5 py-5 md:gap-5 md:px-7">
        <Avatar name={thread.author?.display_name ?? "?"} src={thread.author?.avatar_url} size={44} ring />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {thread.is_pinned && (
              <span className="flex items-center gap-1 rounded-full border border-white/25 bg-white/[0.08] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[1.5px] text-white/80">
                <PinIcon size={9} />
                {t("forum.pinned")}
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[1.5px] text-white/45">
                <LockIcon size={9} />
                {t("forum.locked")}
              </span>
            )}
            {hot && (
              <span className="rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[1.5px] text-white/60">
                {t("forum.hot")}
              </span>
            )}
            <h4 className="min-w-0 truncate text-[14px] font-semibold text-white/85 transition-colors duration-300 group-hover/thread:text-white">
              {thread.title}
            </h4>
          </div>

          <p className="mt-1.5 line-clamp-1 text-[12px] leading-6 text-white/30 transition-colors duration-500 group-hover/thread:text-white/45">
            {markdownExcerpt(thread.body, 160)}
          </p>

          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-white/25">
            <span className="text-white/45">{thread.author?.display_name}</span>
            {(thread.author?.role === "admin" || thread.author?.role === "moderator") && (
              <span className="rounded border border-white/15 px-1 text-[8px] font-bold uppercase tracking-[1px] text-white/50">
                {t(thread.author.role === "admin" ? "role.admin" : "role.moderator")}
              </span>
            )}
            <span>·</span>
            <span className="uppercase tracking-[1.5px] text-white/35">{categoryName}</span>
            <span>·</span>
            <span>{timeAgo(lang, thread.last_activity_at)}</span>
            {imageCount > 0 && (
              <span className="flex items-center gap-1 text-white/35">
                · <ImageIcon size={11} /> {imageCount}
              </span>
            )}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-6 text-right sm:flex">
          <div>
            <p className="flex items-center justify-end gap-1.5 text-[13px] font-semibold text-white/65">
              <ChatIcon size={12} className="text-white/30" />
              {formatNumber(lang, thread.reply_count)}
            </p>
            <p className="text-[9px] uppercase tracking-[2px] text-white/20">{t("forum.replies")}</p>
          </div>
          <div>
            <p className="flex items-center justify-end gap-1.5 text-[13px] font-semibold text-white/65">
              <HeartIcon size={12} className="text-white/30" />
              {formatNumber(lang, thread.like_count)}
            </p>
            <p className="text-[9px] uppercase tracking-[2px] text-white/20">{t("forum.likes")}</p>
          </div>
          <div className="hidden lg:block">
            <p className="text-[13px] font-semibold text-white/65">{formatNumber(lang, thread.view_count)}</p>
            <p className="text-[9px] uppercase tracking-[2px] text-white/20">{t("forum.views")}</p>
          </div>
        </div>

        <span className="hidden w-8 shrink-0 md:block" />
      </Link>

      {onToggleSave && (
        <button
          type="button"
          onClick={() => onToggleSave(thread)}
          aria-pressed={saved}
          aria-label={saved ? t("forum.unsave") : t("forum.save")}
          title={saved ? t("forum.unsave") : t("forum.save")}
          data-sound={saved ? "close" : "success"}
          className={`absolute right-4 top-4 z-[4] flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 md:right-5 md:top-1/2 md:-translate-y-1/2 ${
            saved
              ? "border-white/40 bg-white text-black"
              : "border-white/[0.1] bg-black/40 text-white/35 opacity-100 hover:border-white/40 hover:text-white md:opacity-0 md:group-hover/thread:opacity-100"
          }`}
        >
          <BookmarkIcon size={13} filled={saved} />
        </button>
      )}
    </article>
  );
}

export function ThreadCardSkeleton() {
  return (
    <div className="flex items-center gap-5 rounded-[20px] border border-white/[0.06] bg-[#070707] px-7 py-6">
      <span className="zx-skeleton h-11 w-11 rounded-full" />
      <div className="flex-1 space-y-2.5">
        <span className="zx-skeleton block h-3.5 w-1/2 rounded" />
        <span className="zx-skeleton block h-3 w-3/4 rounded" />
        <span className="zx-skeleton block h-2.5 w-1/4 rounded" />
      </div>
    </div>
  );
}
