"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { MarkdownEditor } from "@/components/forum/markdown-editor";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { createThread } from "@/lib/forum/client";
import type { ForumCategory, MediaItem } from "@/lib/forum/types";
import type { TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ForumCategory[];
  defaultCategoryId?: string | null;
}

const TITLE_MAX = 200;
const BODY_MAX = 20000;

export function CreateThreadModal({ isOpen, onClose, categories, defaultCategoryId }: CreateThreadModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t, lang } = useI18n();
  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);

  // Pick a category as soon as they load (this was the "empty dropdown" bug).
  useEffect(() => {
    if (!isOpen) return;
    if (defaultCategoryId && categories.some((c) => c.id === defaultCategoryId)) {
      setCategoryId(defaultCategoryId);
    } else if (!categoryId && categories[0]) {
      setCategoryId(categories[0].id);
    }
  }, [isOpen, categories, defaultCategoryId, categoryId]);

  async function handleSubmit() {
    if (!user) {
      router.push("/auth/login?next=/forum");
      return;
    }
    setError(null);

    if (title.trim().length < 3) return setError("error.titleLength");
    if (!body.trim()) return setError("error.bodyLength");
    if (!categoryId) return setError("forum.pickCategory");

    setLoading(true);
    const result = await createThread({
      userId: user.id,
      categoryId,
      title,
      body,
      mediaIds: attachments.map((item) => item.id),
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      playSound("error");
      return;
    }

    playSound("success");
    setTitle("");
    setBody("");
    setAttachments([]);
    onClose();
    router.push(`/forum/${result.data.id}`);
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("forum.createTitle")}
      subtitle={t("forum.createSubtitle")}
      maxWidth={760}
      closeLabel={t("common.close")}
    >
      {profile?.is_banned ? (
        <p className="rounded-[14px] border border-red-500/30 bg-red-500/5 px-5 py-4 text-sm text-red-300">
          {t("error.banned")}
        </p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          className="space-y-7"
        >
          {/* Category */}
          <div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[2px] text-white/45">{t("forum.category")}</p>
            {categories.length === 0 ? (
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="zx-skeleton h-10 w-24 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => {
                  const active = category.id === categoryId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoryId(category.id)}
                      data-sound="toggle"
                      className={`zx-rise-in flex items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[1.5px] transition-all duration-300 ${
                        active
                          ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.22)]"
                          : "border-white/[0.12] bg-white/[0.02] text-white/50 hover:border-white/40 hover:text-white"
                      }`}
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <span className={`font-mono text-[9px] ${active ? "text-black/50" : "text-white/25"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {lang === "tr" && category.name_tr ? category.name_tr : category.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="thread-title" className="text-[10px] font-medium uppercase tracking-[2px] text-white/45">
                {t("forum.threadTitle")}
              </label>
              <span className="text-[10px] tabular-nums text-white/25">
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <div className="relative">
              <input
                id="thread-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX))}
                placeholder={t("forum.threadTitlePlaceholder")}
                autoFocus
                className="peer h-14 w-full rounded-[16px] border border-white/[0.12] bg-white/[0.02] px-5 text-[16px] font-medium text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.04]"
              />
              <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-white to-transparent transition-transform duration-700 peer-focus:scale-x-100" />
            </div>
          </div>

          {/* Body */}
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[2px] text-white/45">{t("forum.threadBody")}</p>
            <MarkdownEditor
              value={body}
              onChange={setBody}
              placeholder={t("forum.threadBodyPlaceholder")}
              maxLength={BODY_MAX}
              rows={8}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              onSubmitShortcut={() => void handleSubmit()}
            />
          </div>

          {error && (
            <p className="zx-rise-in rounded-[14px] border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-300">
              {t(error)}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-white/25">{t("forum.rulesHint")}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-full border border-white/[0.12] px-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/55 hover:border-white/30 hover:text-white"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                data-sound="off"
                data-magnetic="0.15"
                className="group relative h-12 overflow-hidden rounded-full bg-white px-8 text-[10px] font-semibold uppercase tracking-[2px] text-black transition-all hover:shadow-[0_0_32px_rgba(255,255,255,0.3)] disabled:opacity-50"
              >
                <span className="pointer-events-none absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-black/10 transition-all duration-700 group-hover:left-[150%]" />
                <span className="relative">{loading ? t("forum.publishing") : t("forum.publish")}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
