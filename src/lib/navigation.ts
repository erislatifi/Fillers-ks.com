import { getTranslations } from "next-intl/server";
import { getPayloadClient } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export type MenuItem = { label: string; href?: string; key?: "brands" | "categories" };
export type FooterLink = { label: string; href: string };

/** Header menu + footer company links from Përmbajtja → Menytë, or the built-in ones. */
export async function getMenus(locale: AppLocale) {
  const [payload, t, tf] = await Promise.all([
    getPayloadClient(),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "footer" }),
  ]);
  const nav = await payload.findGlobal({ slug: "navigation", locale, depth: 0 }).catch(() => null);

  const header: MenuItem[] = nav?.headerItems?.length
    ? nav.headerItems.map((i) =>
        i.type === "brands" || i.type === "categories" ? { label: i.label, key: i.type } : { label: i.label, href: i.href || "/" },
      )
    : [
        { label: t("shop"), href: "/catalog" },
        { label: t("brands"), key: "brands" },
        { label: t("categories"), key: "categories" },
        { label: t("newArrivals"), href: "/new-arrivals" },
        { label: t("promotions"), href: "/promotions" },
        { label: t("education"), href: "/education" },
        { label: t("about"), href: "/about" },
        { label: t("contact"), href: "/contact" },
      ];

  const footer: FooterLink[] = nav?.footerLinks?.length
    ? nav.footerLinks.map((l) => ({ label: l.label, href: l.href }))
    : [
        { label: tf("aboutUs"), href: "/about" },
        { label: tf("education"), href: "/education" },
        { label: tf("promotions"), href: "/promotions" },
        { label: tf("becomePartner"), href: "/account/register" },
        { label: tf("contact"), href: "/contact" },
      ];

  return { header, footer, showWishlist: nav?.showWishlist !== false };
}
