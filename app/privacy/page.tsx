import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PRIVACY } from "@/lib/legal/content";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return { title: t("legal.privacy.title") };
}

export default async function PrivacyPage() {
  const { lang, t } = await getServerT();
  return (
    <LegalPage
      lang={lang}
      t={t}
      eyebrow={t("footer.legal")}
      title={t("legal.privacy.title")}
      intro={t("legal.privacy.intro")}
      sections={PRIVACY[lang]}
      other={{ href: "/terms", label: t("legal.terms.title") }}
    />
  );
}
