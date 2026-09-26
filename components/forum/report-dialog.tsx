"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth/use-auth";
import { useT } from "@/lib/i18n/provider";
import { submitReport } from "@/lib/forum/client";
import type { ReportReason, ReportTarget } from "@/lib/forum/types";
import type { TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import { CheckIcon } from "@/components/ui/icons";

const REASONS: ReportReason[] = ["spam", "harassment", "nsfw", "violence", "misinformation", "other"];

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTarget;
  targetId: string;
}

export function ReportDialog({ open, onClose, targetType, targetId }: ReportDialogProps) {
  const t = useT();
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [done, setDone] = useState(false);

  const close = () => {
    onClose();
    window.setTimeout(() => {
      setDone(false);
      setError(null);
      setDetails("");
      setReason("spam");
    }, 300);
  };

  const submit = async () => {
    if (!user) return;
    setSending(true);
    setError(null);
    const result = await submitReport({ userId: user.id, targetType, targetId, reason, details });
    setSending(false);
    if (result.ok) {
      setDone(true);
      playSound("success");
    } else {
      setError(result.error);
      playSound("error");
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? undefined : t("report.title")}
      subtitle={done ? undefined : t("report.subtitle")}
      maxWidth={520}
      closeLabel={t("common.close")}
    >
      {done ? (
        <div className="py-6 text-center">
          <span className="zx-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.35)]">
            <CheckIcon size={22} />
          </span>
          <h3 className="mt-6 text-xl font-bold text-white">{t("report.thanks")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">{t("report.thanksDesc")}</p>
          <button
            type="button"
            onClick={close}
            className="mt-8 h-11 rounded-full border border-white/20 px-7 text-[10px] font-semibold uppercase tracking-[2px] text-white/70 hover:border-white hover:text-white"
          >
            {t("common.close")}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2.5">
            {REASONS.map((item) => {
              const active = reason === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  data-sound="toggle"
                  className={`rounded-[14px] border px-4 py-3 text-left text-[12px] transition-all duration-300 ${
                    active
                      ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.18)]"
                      : "border-white/[0.1] bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {t(`report.reason.${item}` as TranslationKey)}
                </button>
              );
            })}
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[2px] text-white/45">
              {t("report.details")}
            </label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value.slice(0, 1000))}
              rows={3}
              placeholder={t("report.detailsPlaceholder")}
              className="w-full resize-none rounded-[14px] border border-white/[0.12] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-white/30"
            />
          </div>

          {error && (
            <p className="rounded-[12px] border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-300">{t(error)}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={close}
              className="h-11 flex-1 rounded-full border border-white/[0.12] text-[10px] font-semibold uppercase tracking-[2px] text-white/55 hover:border-white/30 hover:text-white"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={sending || !user}
              data-sound="off"
              className="h-11 flex-1 rounded-full bg-white text-[10px] font-semibold uppercase tracking-[2px] text-black transition-all hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] disabled:opacity-50"
            >
              {sending ? t("common.sending") : t("report.submit")}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
