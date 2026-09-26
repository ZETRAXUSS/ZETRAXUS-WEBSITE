import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { getServerT } from "@/lib/i18n/server";
import { FxProvider } from "@/components/fx/fx-provider";
import { Intro } from "@/components/fx/intro";
import { RouteProgress } from "@/components/fx/route-progress";
import { PageTransition } from "@/components/fx/page-transition";
import { SearchPaletteProvider } from "@/components/search/search-palette";

// Self-hosted (no runtime call to Google Fonts) — weights/styles actually used.
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: {
      default: "ZETRAXUS",
      template: "%s · ZETRAXUS",
    },
    description: t("meta.description"),
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

// Runs before first paint: returning visitors (this session) skip the intro
// without a single frame of it flashing.
const introScript = `try{if(sessionStorage.getItem('zx-intro-seen')==='1'){document.documentElement.classList.add('zx-intro-skip')}}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { lang } = await getServerT();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <I18nProvider initialLang={lang}>
          <AuthProvider>
            <SearchPaletteProvider>
              <Intro />
              <Suspense fallback={null}>
                <RouteProgress />
              </Suspense>
              <PageTransition />
              <FxProvider />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </SearchPaletteProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
