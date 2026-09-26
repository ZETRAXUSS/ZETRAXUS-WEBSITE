"use client";

import { CountUp } from "@/components/fx/count-up";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/translate";

export interface StatItem {
  label: string;
  value: number;
  href?: string;
  onClick?: () => void;
}

/**
 * Instagram / TikTok style stats: compact numbers sitting inside the
 * profile header instead of big separate cards.
 */
export function StatStrip({ items }: { items: StatItem[] }) {
  const { lang } = useI18n();

  return (
    <div className="mt-6 flex flex-wrap items-stretch gap-x-1 gap-y-2">
      {items.map((item, index) => {
        const content = (
          <>
            <span className="text-[17px] font-bold tabular-nums tracking-[-0.01em] text-white md:text-[19px]">
              <CountUp value={item.value} duration={900} format={(value) => formatNumber(lang, value)} />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[1.8px] text-white/35 transition-colors group-hover/stat:text-white/60">
              {item.label}
            </span>
          </>
        );

        const className =
          "group/stat flex items-baseline gap-2 rounded-full px-3.5 py-2 transition-all duration-300 hover:bg-white/[0.05]";

        return (
          <div key={item.label} className="flex items-center">
            {index > 0 && <span className="mr-1 h-4 w-px bg-white/[0.08]" />}
            {item.onClick ? (
              <button type="button" onClick={item.onClick} className={className} data-sound="toggle">
                {content}
              </button>
            ) : (
              <span className={className}>{content}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
