import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { getBrands, getCategories, getSiteSettings } from "@/lib/payload";
import { getFooterPages } from "@/lib/pages";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { mediaUrl } from "@/components/media";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fillers-ks.com"),
  title: {
    default: "Fillers Kosovo | Premium Aesthetic Medicine Distributor",
    template: "%s | Fillers Kosovo",
  },
  description:
    "Kosovo's leading distributor of premium aesthetic medicine — dermal fillers, skin boosters, biostimulators and professional treatments from Juvederm, Teosyal, Profhilo, Neauvia and more. For licensed medical professionals only.",
  keywords: [
    "dermal fillers Kosovo",
    "aesthetic medicine distributor",
    "Juvederm Kosovo",
    "Profhilo Kosovo",
    "Teosyal",
    "skin boosters",
    "biostimulators",
  ],
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const appLocale = locale as AppLocale;
  const [brands, categories, siteSettings, footerPages] = await Promise.all([
    getBrands(appLocale),
    getCategories(appLocale),
    getSiteSettings(appLocale),
    getFooterPages(appLocale),
  ]);
  const { contactPhone, contactEmail, tagline, topBarNotice, englishEnabled } = siteSettings;
  const logoUrl = mediaUrl(siteSettings.logo);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <AnnouncementBar announcement={siteSettings.announcement} />
            <Header brands={brands} categories={categories} contact={{ contactPhone, contactEmail, tagline, topBarNotice, englishEnabled, logoUrl }} />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer brands={brands} categories={categories} siteSettings={siteSettings} footerPages={footerPages} />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
