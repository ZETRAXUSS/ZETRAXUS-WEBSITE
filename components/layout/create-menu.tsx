"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/provider";
import { ArrowRightIcon, PlusIcon } from "@/components/ui/icons";

/**
 * "Create" menu button with dropdown actions.
 */
export function CreateMenu() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        data-sound={open ? "close" : "open"}
        className={`flex h-9 items-center gap-2 rounded-full border px-4 text-[10px] font-semibold uppercase tracking-[1px] transition-all duration-300 ${
          open
            ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.25)]"
            : "border-white/[0.12] bg-white/[0.025] text-white/60 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <PlusIcon size={12} className={`transition-transform duration-500 ${open ? "rotate-45" : ""}`} />
        {t("create.button")}
      </button>

      {open && (
        <div
          role="menu"
          className="zx-drop-in absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#0a0a0a]/95 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        >
          <Link
            href="/forum?new=1"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="group/item flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 transition-colors hover:bg-white/[0.05]"
          >
            <div>
              <p className="text-[11px] font-semibold text-white">{t("create.discussion")}</p>
              <p className="mt-0.5 text-[10px] text-white/40">{t("create.discussionDesc")}</p>
            </div>
            <ArrowRightIcon
              size={13}
              className="shrink-0 text-white/30 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:text-white"
            />
          </Link>

          {[
            { title: t("create.project"), desc: t("create.projectDesc") },
            { title: t("create.world"), desc: t("create.worldDesc") },
          ].map((item, index) => (
            <div
              key={item.title}
              role="menuitem"
              aria-disabled="true"
              className={`flex cursor-not-allowed items-center justify-between gap-3 px-4 py-3.5 opacity-50 ${
                index === 0 ? "border-b border-white/[0.08]" : ""
              }`}
            >
              <div>
                <p className="text-[11px] font-semibold text-white/60">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-white/30">{item.desc}</p>
              </div>
              <span className="shrink-0 text-[8px] uppercase tracking-[1px] text-white/25">{t("common.soon")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
