"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/use-auth";
import { useT } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { ArrowRightIcon, PlusIcon } from "@/components/ui/icons";

type Target = "project" | "world" | "lore" | "character";

const OPTIONS: { kind: Target; title: TranslationKey; desc: TranslationKey }[] = [
  { kind: "project", title: "create.project", desc: "create.projectDesc" },
  { kind: "world", title: "create.world", desc: "create.worldDesc" },
  { kind: "lore", title: "create.lore", desc: "create.loreDesc" },
  { kind: "character", title: "create.character", desc: "create.characterDesc" },
];

function href(kind: Target, signedIn: boolean, query = "") {
  const target = `/create/${kind}${query}`;
  return signedIn ? target : `/auth/login?next=${encodeURIComponent(target)}`;
}

/**
 * White "Create" pill. With `kind` it links straight to that form,
 * otherwise it opens a small menu with all four content types.
 */
export function CreateButton({
  kind,
  query = "",
  label,
  up = false,
}: {
  kind?: Target;
  query?: string;
  label?: string;
  /** Open the menu upwards (inside clipped containers such as the hero). */
  up?: boolean;
}) {
  const t = useT();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pill =
    "inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-7 text-[10px] font-semibold uppercase tracking-[3px] text-black transition-all duration-300 hover:shadow-[0_0_32px_rgba(255,255,255,0.32)]";

  if (kind) {
    return (
      <Link href={href(kind, !!user, query)} data-magnetic="0.2" className={pill}>
        <PlusIcon size={13} />
        {label ?? t(OPTIONS.find((option) => option.kind === kind)!.title)}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        data-sound={open ? "close" : "open"}
        data-magnetic="0.2"
        className={pill}
      >
        <PlusIcon size={13} className={`transition-transform duration-500 ${open ? "rotate-45" : ""}`} />
        {label ?? t("projects.createNew")}
      </button>

      {open && (
        <div className={`absolute left-1/2 z-50 w-72 -translate-x-1/2 ${up ? "bottom-full mb-3" : "top-full mt-3"}`}>
        <div
          role="menu"
          className="zx-drop-in overflow-hidden rounded-[20px] border border-white/[0.1] bg-[#0a0a0a]/95 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          style={{ transformOrigin: up ? "bottom center" : "top center" }}
        >
          {OPTIONS.map((option, index) => (
            <Link
              key={option.kind}
              href={href(option.kind, !!user, query)}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`group/item flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/[0.05] ${
                index < OPTIONS.length - 1 ? "border-b border-white/[0.07]" : ""
              }`}
            >
              <div>
                <p className="text-[12px] font-semibold text-white">{t(option.title)}</p>
                <p className="mt-0.5 text-[11px] text-white/40">{t(option.desc)}</p>
              </div>
              <ArrowRightIcon size={13} className="shrink-0 text-white/30 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:text-white" />
            </Link>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
