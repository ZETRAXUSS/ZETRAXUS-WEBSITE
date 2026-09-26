import Link from "next/link";
import type { LegalSection } from "@/lib/legal/content";
import { LEGAL_UPDATED } from "@/lib/legal/content";
import type { Lang } from "@/lib/i18n/config";
import type { Translate } from "@/lib/i18n/translate";

export function LegalPage({
  lang,
  t,
  eyebrow,
  title,
  intro,
  sections,
  other,
}: {
  lang: Lang;
  t: Translate;
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  other: { href: string; label: string };
}) {
  const updated = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(LEGAL_UPDATED),
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-16 md:px-10 md:pt-24">
        <div className="zx-rise-in max-w-3xl">
          <p className="text-[10px] uppercase tracking-[5px] text-white/30">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] md:text-6xl">{title}</h1>
          <p className="mt-6 text-sm leading-7 text-white/45 md:text-base">{intro}</p>
          <p className="mt-6 text-[10px] uppercase tracking-[3px] text-white/25">
            {t("legal.updated")} · {updated}
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="hidden lg:block">
            <div className="sticky top-8 space-y-1 border-l border-white/[0.08]">
              {sections.map((section, index) => (
                <a
                  key={section.heading}
                  href={`#s${index + 1}`}
                  className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[12px] text-white/35 transition-all duration-300 hover:border-white hover:pl-5 hover:text-white"
                >
                  {section.heading}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12 pb-10">
            {sections.map((section, index) => (
              <section
                key={section.heading}
                id={`s${index + 1}`}
                className="zx-rise-in scroll-mt-10 border-b border-white/[0.06] pb-12 last:border-0"
                style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
              >
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="mt-4 text-[15px] leading-8 text-white/55">
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-5 space-y-3">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-4 text-[15px] leading-7 text-white/55">
                        <span className="mt-[13px] h-px w-4 shrink-0 bg-white/40" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <Link
              href={other.href}
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-white/60 transition-all hover:border-white hover:text-white"
            >
              {other.label}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
