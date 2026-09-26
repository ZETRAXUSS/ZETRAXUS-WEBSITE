"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { FieldLabel, inputClass } from "./ui";

/**
 * Preset chips + free text. Presets are stored as their key
 * ("dark_fantasy") and translated on display; custom text is stored as-is.
 */
export function TagPicker({
  label,
  hint,
  group,
  presets,
  value,
  onChange,
  max = 40,
}: {
  label: string;
  hint?: string;
  group: "world" | "lore" | "character" | "genre" | "scale";
  presets: readonly string[];
  value: string;
  onChange: (value: string) => void;
  max?: number;
}) {
  const { t } = useI18n();
  const isPreset = presets.includes(value);
  const [custom, setCustom] = useState(!isPreset && !!value);

  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = value === preset;
          return (
            <button
              key={preset}
              type="button"
              data-sound="toggle"
              onClick={() => {
                setCustom(false);
                onChange(active ? "" : preset);
              }}
              className={`rounded-full border px-4 py-2 text-[11px] font-medium transition-all duration-300 ${
                active
                  ? "border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "border-white/[0.12] bg-white/[0.02] text-white/50 hover:border-white/40 hover:text-white"
              }`}
            >
              {t(`tag.${group}.${preset}` as TranslationKey)}
            </button>
          );
        })}
        <button
          type="button"
          data-sound="toggle"
          onClick={() => {
            setCustom(true);
            if (isPreset) onChange("");
          }}
          className={`rounded-full border border-dashed px-4 py-2 text-[11px] font-medium transition-all duration-300 ${
            custom ? "border-white/60 text-white" : "border-white/[0.18] text-white/40 hover:border-white/40 hover:text-white"
          }`}
        >
          {t("projects.tag.custom")}
        </button>
      </div>
      {custom && (
        <input
          autoFocus
          value={isPreset ? "" : value}
          onChange={(event) => onChange(event.target.value.slice(0, max))}
          placeholder={t("projects.tag.customPh")}
          className={`${inputClass} zx-rise-in mt-3 max-w-sm`}
        />
      )}
    </div>
  );
}
