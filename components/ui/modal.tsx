"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { playSound } from "@/lib/sound/engine";
import { CloseIcon } from "@/components/ui/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
  /** Close label for the X button (screen readers). */
  closeLabel?: string;
}

/**
 * Shared animated modal: portal to <body>, blurred backdrop, panel that
 * rises out of a blur, exit animation, Esc + backdrop close, scroll lock.
 */
export function Modal({ open, onClose, children, title, subtitle, maxWidth = 620, closeLabel = "Close" }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      playSound("open");
    } else if (render) {
      setClosing(true);
      playSound("close");
      const timer = window.setTimeout(() => {
        setRender(false);
        setClosing(false);
      }, 240);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!render) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [render, onClose]);

  if (!mounted || !render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md ${closing ? "zx-backdrop-out" : "zx-backdrop-in"}`}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 py-10">
          <div
            className={`pointer-events-auto relative w-full overflow-hidden rounded-[26px] border border-white/[0.12] bg-[#080808] shadow-[0_40px_140px_rgba(0,0,0,0.85)] ${
              closing ? "zx-panel-out" : "zx-panel-in"
            }`}
            style={{ maxWidth }}
          >
            <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[90px]" />

            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              data-sound="off"
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/50 transition-all duration-300 hover:rotate-90 hover:border-white/30 hover:text-white"
            >
              <CloseIcon size={14} />
            </button>

            <div className="relative p-7 md:p-9">
              {title && (
                <div className="mb-7 pr-10">
                  <h2 className="text-2xl font-black tracking-[-0.02em] text-white">{title}</h2>
                  {subtitle && <p className="mt-1.5 text-sm text-white/40">{subtitle}</p>}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
