"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { MediaItem } from "@/lib/forum/types";
import { useT } from "@/lib/i18n/provider";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/components/ui/icons";
import { playSound } from "@/lib/sound/engine";

/** Image grid for posts + full-screen lightbox with keyboard navigation. */
export function MediaGallery({ items, viewerId }: { items: MediaItem[]; viewerId?: string | null }) {
  const t = useT();
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Pending images are only visible to their owner (RLS), labelled as such.
  const visible = items.filter((item) => item.status === "approved" || item.owner_id === viewerId);

  const close = useCallback(() => {
    setIndex(null);
    playSound("close");
  }, []);

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => (current === null ? current : (current + delta + visible.length) % visible.length));
      playSound("hover");
    },
    [visible.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  if (!visible.length) return null;

  const single = visible.length === 1;

  return (
    <>
      <div className={`mt-6 grid gap-3 ${single ? "grid-cols-1" : visible.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
        {visible.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setIndex(i);
              playSound("open");
            }}
            data-sound="off"
            className="group relative overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#0a0a0a] transition-all duration-500 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            style={{ aspectRatio: single && item.width && item.height ? `${item.width} / ${item.height}` : "4 / 3", maxHeight: single ? 560 : undefined }}
          >
            <img
              src={item.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
            {item.status === "pending" && (
              <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[1.5px] text-white/80 backdrop-blur">
                {t("editor.pendingReview")}
              </span>
            )}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {mounted &&
        index !== null &&
        createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center" role="dialog" aria-modal="true">
            <div className="zx-backdrop-in absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={close} />

            <img
              key={visible[index].id}
              src={visible[index].url}
              alt=""
              className="zx-panel-in relative max-h-[86vh] max-w-[92vw] rounded-[14px] object-contain shadow-[0_40px_140px_rgba(0,0,0,0.9)]"
            />

            <button
              type="button"
              onClick={close}
              aria-label={t("common.close")}
              data-sound="off"
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/70 transition-all hover:rotate-90 hover:text-white"
            >
              <CloseIcon size={16} />
            </button>

            {visible.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t("common.previous")}
                  data-sound="off"
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/70 hover:-translate-x-0.5 hover:text-white md:left-8"
                >
                  <ArrowLeftIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t("common.next")}
                  data-sound="off"
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/70 hover:translate-x-0.5 hover:text-white md:right-8"
                >
                  <ArrowRightIcon size={16} />
                </button>
                <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[3px] text-white/40">
                  {String(index + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
                </p>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
