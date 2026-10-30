import { getPayloadClient } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

// These slugs have their own routes; any other page lives under /info/<slug>.
const OWN_ROUTES = ["privacy", "terms", "shipping", "faq"];

export const pageHref = (slug: string) => (OWN_ROUTES.includes(slug) ? `/${slug}` : `/info/${slug}`);

export async function getPageBySlug(slug: string, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function getFooterPages(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    locale,
    where: { showInFooter: { equals: true } },
    sort: "createdAt",
    limit: 20,
    depth: 0,
  });
  return result.docs.map((p) => ({ title: p.title, href: pageHref(p.slug) }));
}
