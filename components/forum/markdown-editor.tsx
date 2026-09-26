"use client";

import { useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { playSound } from "@/lib/sound/engine";
import { removeUpload, uploadImage } from "@/lib/forum/client";
import type { MediaItem } from "@/lib/forum/types";
import type { TranslationKey } from "@/lib/i18n/translate";
import { Markdown } from "@/components/forum/markdown";
import {
  BoldIcon,
  CloseIcon,
  CodeIcon,
  HeadingIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
  StrikeIcon,
} from "@/components/ui/icons";

export interface UploadingItem {
  key: string;
  preview: string;
  status: "uploading" | "error";
  error?: TranslationKey;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  rows?: number;
  attachments?: MediaItem[];
  onAttachmentsChange?: (items: MediaItem[]) => void;
  maxAttachments?: number;
  autoFocus?: boolean;
  onSubmitShortcut?: () => void;
  disabled?: boolean;
  /** Projects area: no link button, links are rejected by the server. */
  noLinks?: boolean;
  /** Upload images straight into the text (`![](url)`), e.g. lore entries. */
  inlineImages?: "lore";
}

type Action = {
  label: TranslationKey;
  icon: ReactNode;
  apply: (selected: string) => { text: string; select?: [number, number] };
  line?: boolean;
};

const ACTIONS: Action[] = [
  { label: "editor.bold", icon: <BoldIcon size={14} />, apply: (s) => ({ text: `**${s || "text"}**`, select: [2, 2 + (s || "text").length] }) },
  { label: "editor.italic", icon: <ItalicIcon size={14} />, apply: (s) => ({ text: `*${s || "text"}*`, select: [1, 1 + (s || "text").length] }) },
  { label: "editor.strike", icon: <StrikeIcon size={14} />, apply: (s) => ({ text: `~~${s || "text"}~~`, select: [2, 2 + (s || "text").length] }) },
  { label: "editor.heading", icon: <HeadingIcon size={14} />, line: true, apply: (s) => ({ text: `## ${s || "Heading"}` }) },
  { label: "editor.quote", icon: <QuoteIcon size={14} />, line: true, apply: (s) => ({ text: (s || "quote").split("\n").map((l) => `> ${l}`).join("\n") }) },
  { label: "editor.list", icon: <ListIcon size={14} />, line: true, apply: (s) => ({ text: (s || "item").split("\n").map((l) => `- ${l}`).join("\n") }) },
  { label: "editor.code", icon: <CodeIcon size={14} />, apply: (s) => (s.includes("\n") ? { text: `\`\`\`\n${s}\n\`\`\`` } : { text: `\`${s || "code"}\``, select: [1, 1 + (s || "code").length] }) },
  { label: "editor.link", icon: <LinkIcon size={14} />, apply: (s) => ({ text: `[${s || "text"}](https://)`, select: [(s || "text").length + 3, (s || "text").length + 11] }) },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 6,
  attachments = [],
  onAttachmentsChange,
  maxAttachments = 6,
  autoFocus,
  onSubmitShortcut,
  disabled,
  noLinks = false,
  inlineImages,
}: MarkdownEditorProps) {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;

  const actions = noLinks ? ACTIONS.filter((action) => action.label !== "editor.link") : ACTIONS;
  const canAttach = !!onAttachmentsChange || !!inlineImages;
  const inlineCount = inlineImages ? (value.match(/!\[[^\]]*\]\(/g) ?? []).length : 0;
  const slotsLeft = inlineImages
    ? maxAttachments - inlineCount - uploading.filter((u) => u.status === "uploading").length
    : maxAttachments - attachments.length - uploading.filter((u) => u.status === "uploading").length;
  const valueRef = useRef(value);
  valueRef.current = value;

  const insertImage = (url: string) => {
    const el = textareaRef.current;
    const current = valueRef.current;
    const at = el && tab === "write" ? el.selectionEnd : current.length;
    const before = current.slice(0, at);
    const after = current.slice(at);
    const snippet = `${before && !before.endsWith("\n") ? "\n" : ""}\n![](${url})\n${after.startsWith("\n") ? "" : "\n"}`;
    const next = before + snippet + after;
    if (next.length > maxLength) return;
    valueRef.current = next;
    onChange(next);
  };

  const applyAction = (action: Action) => {
    const el = textareaRef.current;
    if (!el) return;
    let start = el.selectionStart;
    let end = el.selectionEnd;

    if (action.line) {
      start = value.lastIndexOf("\n", start - 1) + 1;
      const nextBreak = value.indexOf("\n", end);
      end = nextBreak === -1 ? value.length : nextBreak;
    }

    const selected = value.slice(start, end);
    const result = action.apply(selected);
    const next = value.slice(0, start) + result.text + value.slice(end);
    if (next.length > maxLength) return;
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      if (result.select) {
        el.setSelectionRange(start + result.select[0], start + result.select[1]);
      } else {
        el.setSelectionRange(start + result.text.length, start + result.text.length);
      }
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!canAttach) return;
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const allowed = list.slice(0, Math.max(0, slotsLeft));
    if (!allowed.length) return;

    await Promise.all(
      allowed.map(async (file) => {
        const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const preview = URL.createObjectURL(file);
        setUploading((current) => [...current, { key, preview, status: "uploading" }]);

        const result = await uploadImage(file, inlineImages ?? "forum");
        if (result.ok && inlineImages && result.data.status !== "approved") {
          // Only reviewed images may appear inside the text.
          void removeUpload(result.data.id);
          setUploading((current) =>
            current.map((item) => (item.key === key ? { ...item, status: "error", error: "editor.inlinePending" } : item)),
          );
          playSound("error");
        } else if (result.ok) {
          URL.revokeObjectURL(preview);
          setUploading((current) => current.filter((item) => item.key !== key));
          if (inlineImages) {
            insertImage(result.data.url);
          } else if (onAttachmentsChange) {
            attachmentsRef.current = [...attachmentsRef.current, result.data];
            onAttachmentsChange(attachmentsRef.current);
          }
          playSound("success");
        } else {
          setUploading((current) =>
            current.map((item) => (item.key === key ? { ...item, status: "error", error: result.error } : item)),
          );
          playSound("error");
        }
      }),
    );
  };

  const removeAttachment = (item: MediaItem) => {
    onAttachmentsChange?.(attachments.filter((entry) => entry.id !== item.id));
    void removeUpload(item.id);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSubmitShortcut?.();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && (event.key === "b" || event.key === "i")) {
      event.preventDefault();
      applyAction(ACTIONS[event.key === "b" ? 0 : 1]);
    }
  };

  const nearLimit = value.length > maxLength * 0.9;

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border bg-white/[0.02] transition-all duration-500 ${
        dragging
          ? "border-white/60 shadow-[0_0_0_4px_rgba(255,255,255,0.06),0_0_40px_rgba(255,255,255,0.12)]"
          : focused
            ? "border-white/30 shadow-[0_0_0_4px_rgba(255,255,255,0.03)]"
            : "border-white/[0.12]"
      }`}
      onDragOver={(event) => {
        if (!canAttach) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        if (!canAttach) return;
        event.preventDefault();
        setDragging(false);
        if (event.dataTransfer.files?.length) void handleFiles(event.dataTransfer.files);
      }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-2 py-1.5">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => applyAction(action)}
              disabled={disabled || tab === "preview"}
              title={t(action.label)}
              aria-label={t(action.label)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-white/40 transition-all duration-200 hover:bg-white/[0.07] hover:text-white disabled:opacity-30"
            >
              {action.icon}
            </button>
          ))}
          {canAttach && (
            <>
              <span className="mx-1 h-4 w-px bg-white/[0.1]" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={disabled || slotsLeft <= 0}
                title={t("editor.image")}
                aria-label={t("editor.image")}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] px-2 text-white/40 transition-all duration-200 hover:bg-white/[0.07] hover:text-white disabled:opacity-30"
              >
                <ImageIcon size={14} />
                <span className="hidden text-[10px] font-medium uppercase tracking-[1px] sm:inline">{t("editor.image")}</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) void handleFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </>
          )}
        </div>

        <div className="relative flex shrink-0 rounded-full border border-white/[0.08] p-[2px]">
          <span
            className="absolute top-[2px] h-[26px] w-[62px] rounded-full bg-white/[0.1] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(${tab === "write" ? 0 : 62}px)` }}
          />
          {(["write", "preview"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTab(mode)}
              data-sound="toggle"
              className={`relative z-10 h-[26px] w-[62px] rounded-full text-[9px] font-semibold uppercase tracking-[1.5px] transition-colors ${
                tab === mode ? "text-white" : "text-white/35 hover:text-white/70"
              }`}
            >
              {t(mode === "write" ? "editor.write" : "editor.preview")}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={(event) => {
            if (!canAttach) return;
            const files: File[] = Array.from(event.clipboardData?.files ?? []);
            if (files.length) {
              event.preventDefault();
              void handleFiles(files);
            }
          }}
          placeholder={placeholder}
          rows={rows}
          autoFocus={autoFocus}
          disabled={disabled}
          className="block w-full resize-y bg-transparent px-5 py-4 text-[14px] leading-7 text-white outline-none placeholder:text-white/20 disabled:opacity-50"
          style={{ minHeight: rows * 28 + 32 }}
        />
      ) : (
        <div className="min-h-[140px] px-5 py-4" style={{ minHeight: rows * 28 + 32 }}>
          {value.trim() ? (
            <Markdown source={value} noLinks={noLinks} images={!!inlineImages} />
          ) : (
            <p className="text-[13px] text-white/25">{t("editor.nothingToPreview")}</p>
          )}
        </div>
      )}

      {/* Attachments */}
      {(attachments.length > 0 || uploading.length > 0) && (
        <div className="flex flex-wrap gap-3 border-t border-white/[0.06] px-4 py-4">
          {attachments.map((item) => (
            <div
              key={item.id}
              className="zx-rise-in group relative h-20 w-20 overflow-hidden rounded-[14px] border border-white/[0.12] bg-black"
            >
              <img src={item.url} alt="" className="h-full w-full object-cover" />
              {item.status === "pending" && (
                <span className="absolute inset-x-0 bottom-0 bg-black/75 px-1 py-0.5 text-center text-[8px] uppercase tracking-[1px] text-white/70">
                  {t("editor.pendingReview")}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(item)}
                aria-label={t("common.remove")}
                data-sound="close"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white/70 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
              >
                <CloseIcon size={11} />
              </button>
            </div>
          ))}

          {uploading.map((item) => (
            <div
              key={item.key}
              className={`relative h-20 w-20 overflow-hidden rounded-[14px] border bg-black ${
                item.status === "error" ? "border-red-400/40" : "border-white/[0.12]"
              }`}
              title={item.error ? t(item.error) : undefined}
            >
              <img src={item.preview} alt="" className="h-full w-full object-cover opacity-40 blur-[1px]" />
              {item.status === "uploading" ? (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <span className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white" />
                  <span className="text-[7px] uppercase tracking-[1px] text-white/70">{t("editor.scanning")}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setUploading((current) => current.filter((entry) => entry.key !== item.key))}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 px-1 text-center"
                >
                  <CloseIcon size={12} className="text-red-300" />
                  <span className="text-[7px] leading-tight text-red-200/90">{item.error ? t(item.error) : ""}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-2.5 text-[10px] text-white/25">
        <span className="truncate">
          {noLinks ? t("editor.hintNoLinks") : canAttach ? t("editor.hintWithImages") : t("editor.hint")}
        </span>
        <span className={`shrink-0 tabular-nums ${nearLimit ? "text-white/70" : ""}`}>
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>

      {dragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[2px] text-white">
            <ImageIcon size={16} />
            {t("editor.dropHere")}
          </p>
        </div>
      )}
    </div>
  );
}
