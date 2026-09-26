import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { TERMS } from "@/lib/legal/content";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return { title: t("legal.terms.title") };
}

export default async function TermsPage() {
  const { lang, t } = await getServerT();
  return (
    <LegalPage
      lang={lang}
      t={t}
      eyebrow={t("footer.legal")}
      title={t("legal.terms.title")}
      intro={t("legal.terms.intro")}
      sections={TERMS[lang]}
      other={{ href: "/privacy", label: t("legal.privacy.title") }}
    />
  );
}
