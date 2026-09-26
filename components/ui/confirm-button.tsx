"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ConfirmButtonProps {
  onConfirm: () => void | Promise<void>;
  children: ReactNode;
  confirmLabel: string;
  className?: string;
  confirmClassName?: string;
  title?: string;
}

/** Two-step destructive button: first click arms it for 3 seconds. */
export function ConfirmButton({ onConfirm, children, confirmLabel, className = "", confirmClassName = "", title }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      title={title}
      disabled={busy}
      data-sound={armed ? "error" : "click"}
      onClick={async () => {
        if (!armed) {
          setArmed(true);
          return;
        }
        setBusy(true);
        await onConfirm();
        setBusy(false);
        setArmed(false);
      }}
      className={armed ? confirmClassName || className : className}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
