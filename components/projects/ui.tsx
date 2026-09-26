"use client";

import { useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, type TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import type { CreationKind, ProjectStatus } from "@/lib/projects/types";
import { CheckIcon, CloseIcon, HeartIcon, ImageIcon, UploadIcon } from "@/components/ui/icons";

export const pillButton =
  "flex h-10 items-center gap-2 rounded-full border border-white/[0.12] px-4 text-[11px] font-semibold text-white/60 transition-all duration-300 hover:border-white/40 hover:text-white";
export const iconButton =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] text-white/45 transition-all duration-300 hover:border-white/40 hover:text-white";
export const solidButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-7 text-[10px] font-semibold uppercase tracking-[2px] text-black transition-all hover:shadow-[0_0_28px_rgba(255,255,255,0.28)] disabled:opacity-40";
export const ghostButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/55 transition-all hover:border-white/35 hover:text-white disabled:opacity-40";
export const inputClass =
  "h-12 w-full rounded-[14px] border border-white/[0.12] bg-white/[0.03] px-4 text-[14px] text-white outline-none transition-all placeholder:text-white/20 focus:border-white/35 focus:bg-white/[0.05]";
export const textareaClass =
  "w-full resize-y rounded-[14px] border border-white/[0.12] bg-white/[0.03] px-4 py-3 text-[14px] leading-7 text-white outline-none transition-all placeholder:text-white/20 focus:border-white/35 focus:bg-white/[0.05]";
export const panelClass = "rounded-[24px] border border-white/[0.1] bg-[#060606]";

export const KIND_LABEL: Record<CreationKind, TranslationKey> = {
  world: "projects.kind.world",
  lore: "projects.kind.lore",
  character: "projects.kind.character",
};

export const KIND_PLURAL: Record<CreationKind, TranslationKey> = {
  world: "projects.tab.worlds",
  lore: "projects.tab.lore",
  character: "projects.tab.characters",
};

/** Preset tags are stored as keys ("dark_fantasy"), custom tags as text. */
export function useTagLabel() {
  const { t } = useI18n();
  return (group: "world" | "lore" | "character" | "genre" | "scale" | "city", value: string | null | undefined) => {
    if (!value) return "";
    const key = `tag.${group}.${value}` as TranslationKey;
    const translated = t(key);
    return translated === key ? value : translated;
  };
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <p className="zx-rise-in rounded-[14px] border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] leading-6 text-red-300">
      {children}
    </p>
  );
}

export function StatusBadge({ status, size = "md" }: { status: ProjectStatus; size?: "sm" | "md" }) {
  const { t } = useI18n();
  const done = status === "completed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase ${
        size === "sm" ? "px-2.5 py-1 text-[8px] tracking-[1.5px]" : "px-3 py-1.5 text-[9px] tracking-[2px]"
      } ${
        done
          ? "border-white/70 bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.25)]"
          : "border-white/20 bg-black/40 text-white/75 backdrop-blur-md"
      }`}
    >
      {done ? (
        <CheckIcon size={size === "sm" ? 9 : 10} />
      ) : (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      )}
      {t(done ? "projects.status.completed" : "projects.status.inProgress")}
    </span>
  );
}

export function Chip({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[1.5px] ${
        strong ? "border-white/30 bg-white/[0.08] text-white/85" : "border-white/[0.12] text-white/45"
      }`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
      <div>
        <p className="text-[10px] uppercase tracking-[5px] text-white/25">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-white md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function FieldLabel({ label, hint, required, counter }: { label: string; hint?: string; required?: boolean; counter?: string }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[2.5px] text-white/60">
          {label}
          {required && <span className="ml-1 text-white">*</span>}
        </p>
        {hint && <p className="mt-1 text-[12px] leading-5 text-white/30">{hint}</p>}
      </div>
      {counter && <span className="shrink-0 text-[10px] tabular-nums text-white/25">{counter}</span>}
    </div>
  );
}

export function LikeButton({
  liked,
  count,
  onToggle,
  compact,
}: {
  liked: boolean;
  count: number;
  onToggle: () => void;
  compact?: boolean;
}) {
  const { lang, t } = useI18n();
  const [burst, setBurst] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        if (!liked) setBurst((value) => value + 1);
        onToggle();
      }}
      aria-pressed={liked}
      aria-label={t("forum.likes")}
      data-sound={liked ? "click" : "success"}
      className={
        compact
          ? `flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-all duration-300 ${
              liked ? "bg-white text-black" : "text-white/40 hover:bg-white/[0.06] hover:text-white"
            }`
          : `relative flex h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-semibold transition-all duration-300 ${
              liked
                ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                : "border-white/[0.12] text-white/60 hover:border-white/40 hover:text-white"
            }`
      }
    >
      <span key={burst} className={`relative ${burst ? "zx-burst" : ""}`}>
        <HeartIcon size={compact ? 13 : 15} filled={liked} />
        {burst > 0 && liked && !compact && <span className="zx-ripple absolute inset-0 rounded-full border border-current" />}
      </span>
      {(!compact || count > 0) && formatNumber(lang, count)}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Image slot (cover / map / planet / portrait)                        */
/* ------------------------------------------------------------------ */

export interface ImageSlotState {
  /** Already stored image. */
  url: string | null;
  /** File chosen but not uploaded yet (new items upload after save). */
  file: File | null;
  preview: string | null;
  status: "idle" | "uploading" | "error" | "pending";
  error?: TranslationKey;
}

export const emptySlot = (url: string | null = null): ImageSlotState => ({ url, file: null, preview: null, status: "idle" });

export function ImageSlot({
  label,
  hint,
  state,
  onPick,
  onClear,
  aspect = "aspect-[16/9]",
  round,
  aiBadge,
}: {
  label: string;
  hint?: string;
  state: ImageSlotState;
  onPick: (file: File) => void;
  onClear: () => void;
  aspect?: string;
  round?: boolean;
  aiBadge?: string;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const src = state.preview ?? state.url;

  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div
        className={`group relative overflow-hidden border bg-[#050505] transition-all duration-500 ${aspect} ${
          round ? "rounded-full" : "rounded-[20px]"
        } ${
          dragging
            ? "border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.12)]"
            : state.status === "error"
              ? "border-red-400/40"
              : "border-white/[0.12] hover:border-white/30"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file && file.type.startsWith("image/")) onPick(file);
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className={`h-full w-full object-cover transition-all duration-700 ${
              state.status === "uploading" ? "scale-[1.02] opacity-40 blur-[2px]" : "group-hover:scale-[1.02]"
            }`}
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30 transition-colors hover:text-white/70"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.03] transition-all duration-500 group-hover:scale-110 group-hover:border-white/40">
              <UploadIcon size={18} />
            </span>
            <span className="px-4 text-center text-[10px] font-semibold uppercase tracking-[2px]">{t("projects.image.choose")}</span>
            {aiBadge && <span className="px-6 text-center text-[10px] normal-case tracking-normal text-white/25">{aiBadge}</span>}
          </button>
        )}

        {state.status === "uploading" && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="h-7 w-7 animate-spin rounded-full border border-white/20 border-t-white" />
            <span className="text-[9px] uppercase tracking-[2px] text-white/80">{t("editor.scanning")}</span>
          </span>
        )}

        {src && state.status !== "uploading" && (
          <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-8 items-center gap-1.5 rounded-full bg-black/80 px-3 text-[10px] font-semibold uppercase tracking-[1px] text-white/80 backdrop-blur hover:text-white"
            >
              <ImageIcon size={12} /> {t("projects.image.replace")}
            </button>
            <button
              type="button"
              onClick={onClear}
              aria-label={t("common.remove")}
              data-sound="close"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white/70 backdrop-blur hover:text-white"
            >
              <CloseIcon size={12} />
            </button>
          </div>
        )}

        {state.file && state.status === "idle" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1 text-[9px] uppercase tracking-[1.5px] text-white/70 backdrop-blur">
            {t("projects.image.afterSave")}
          </span>
        )}
        {state.status === "pending" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1 text-[9px] uppercase tracking-[1.5px] text-white/70 backdrop-blur">
            {t("editor.pendingReview")}
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onPick(file);
              playSound("click");
            }
            event.target.value = "";
          }}
        />
      </div>
      {state.status === "error" && state.error && (
        <div className="mt-3">
          <ErrorBox>{t(state.error)}</ErrorBox>
        </div>
      )}
    </div>
  );
}
