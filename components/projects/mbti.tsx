"use client";

import { useI18n } from "@/lib/i18n/provider";
import { MBTI_AXES, mbtiGroup } from "@/lib/projects/fields";
import { FieldLabel } from "./ui";

function parse(value: string) {
  const upper = value.toUpperCase();
  const letters = upper.slice(0, 4).split("");
  const variant = upper.length > 4 ? upper.slice(5, 6) : "";
  return { letters: letters.length === 4 ? letters : [], variant };
}

/** Four binary axes + optional -A / -T identity. Empty = not set. */
export function MbtiPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  const { letters, variant } = parse(value);
  const set = letters.length === 4;

  const choose = (axis: number, letter: string) => {
    const base = set ? [...letters] : MBTI_AXES.map((a) => a.letters[0]);
    base[axis] = letter;
    onChange(base.join("") + (variant ? `-${variant}` : ""));
  };

  const setVariant = (next: string) => {
    if (!set) return;
    onChange(letters.join("") + (next ? `-${next}` : ""));
  };

  return (
    <div>
      <FieldLabel label={t("character.mbti")} hint={t("character.mbtiHint")} />
      <div className="rounded-[20px] border border-white/[0.1] bg-white/[0.015] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span
              key={value}
              className={`font-mono text-4xl font-black tracking-[6px] transition-all duration-500 md:text-5xl ${set ? "zx-pop text-white" : "text-white/15"}`}
            >
              {set ? letters.join("") : "····"}
            </span>
            {set && variant && <span className="font-mono text-lg text-white/40">-{variant}</span>}
          </div>
          <div className="flex items-center gap-3">
            {set && <span className="rounded-full border border-white/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] text-white/70">{t(mbtiGroup(value))}</span>}
            {set && (
              <button
                type="button"
                onClick={() => onChange("")}
                data-sound="close"
                className="text-[10px] font-semibold uppercase tracking-[2px] text-white/35 hover:text-white"
              >
                {t("common.clear")}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {MBTI_AXES.map((axis, index) => (
            <div key={axis.letters.join("")} className="relative grid grid-cols-2 rounded-full border border-white/[0.1] p-1">
              <span
                className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  set ? "opacity-100" : "opacity-0"
                }`}
                style={{ left: letters[index] === axis.letters[1] ? "calc(50% + 0px)" : "4px" }}
              />
              {axis.letters.map((letter, side) => {
                const active = set && letters[index] === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    data-sound="toggle"
                    onClick={() => choose(index, letter)}
                    className={`relative z-10 flex h-10 items-center justify-center gap-2 rounded-full text-[11px] transition-colors duration-300 ${
                      active ? "font-bold text-black" : "text-white/45 hover:text-white"
                    }`}
                  >
                    <span className="font-mono font-bold">{letter}</span>
                    <span className="hidden sm:inline">{t(axis.labels[side])}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[10px] uppercase tracking-[2px] text-white/30">{t("character.identity")}</span>
          {["", "A", "T"].map((option) => (
            <button
              key={option || "none"}
              type="button"
              disabled={!set}
              onClick={() => setVariant(option)}
              className={`rounded-full border px-3 py-1.5 text-[10px] transition-all disabled:opacity-30 ${
                variant === option && set ? "border-white bg-white text-black" : "border-white/[0.12] text-white/45 hover:border-white/40 hover:text-white"
              }`}
            >
              {option === "" ? t("character.identityNone") : option === "A" ? t("mbti.A") : t("mbti.T_identity")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Read-only MBTI card for the character page. */
export function MbtiCard({ value }: { value: string }) {
  const { t } = useI18n();
  const { letters, variant } = parse(value);
  if (letters.length !== 4) return null;

  return (
    <div className="rounded-[22px] border border-white/[0.1] bg-[#060606] p-6">
      <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("character.mbti")}</p>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-mono text-4xl font-black tracking-[6px] text-white">{letters.join("")}</span>
        {variant && <span className="font-mono text-base text-white/40">-{variant}</span>}
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[2px] text-white/45">{t(mbtiGroup(value))}</p>
      <div className="mt-5 space-y-2.5">
        {MBTI_AXES.map((axis, index) => {
          const right = letters[index] === axis.letters[1];
          return (
            <div key={axis.letters.join("")} className="flex items-center gap-3 text-[10px]">
              <span className={`w-20 truncate ${!right ? "font-semibold text-white" : "text-white/30"}`}>{t(axis.labels[0])}</span>
              <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                <span
                  className="absolute top-0 h-full w-1/2 rounded-full bg-white/80 transition-all duration-700"
                  style={{ left: right ? "50%" : "0%" }}
                />
              </span>
              <span className={`w-20 truncate text-right ${right ? "font-semibold text-white" : "text-white/30"}`}>{t(axis.labels[1])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
