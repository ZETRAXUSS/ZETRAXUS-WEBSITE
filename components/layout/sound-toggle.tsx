"use client";

import { useEffect, useState } from "react";
import { getSoundEngine } from "@/lib/sound/engine";
import { useT } from "@/lib/i18n/provider";

/** Header sound switch with a tiny live equalizer while sound is on. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const t = useT();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const engine = getSoundEngine();
    setEnabled(engine.isEnabled());
    return engine.subscribe(setEnabled);
  }, []);

  return (
    <button
      type="button"
      onClick={() => getSoundEngine().setEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? t("header.soundOff") : t("header.soundOn")}
      title={enabled ? t("header.soundOff") : t("header.soundOn")}
      data-sound="off"
      className={`group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
        enabled
          ? "border-white/[0.16] bg-white/[0.04] text-white/80 hover:border-white/40 hover:text-white"
          : "border-white/[0.1] bg-white/[0.02] text-white/30 hover:border-white/30 hover:text-white/70"
      } ${className}`}
    >
      {enabled ? (
        <span className="zx-eq flex h-3.5 items-end gap-[2.5px]" aria-hidden="true">
          <span className="block h-full w-[2px] rounded-full bg-current" />
          <span className="block h-full w-[2px] rounded-full bg-current" />
          <span className="block h-full w-[2px] rounded-full bg-current" />
        </span>
      ) : (
        <span className="flex h-3.5 items-end gap-[2.5px]" aria-hidden="true">
          <span className="block h-[3px] w-[2px] rounded-full bg-current" />
          <span className="block h-[3px] w-[2px] rounded-full bg-current" />
          <span className="block h-[3px] w-[2px] rounded-full bg-current" />
        </span>
      )}
    </button>
  );
}
