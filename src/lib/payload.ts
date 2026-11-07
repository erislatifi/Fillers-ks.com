import config from "@payload-config";
import { getPayload, type Payload, type Where } from "payload";
import type { AppLocale } from "@/i18n/routing";

// Anything unticked as "I dukshëm në faqe" in the admin never reaches the public site.
// A product is also hidden when its brand or category is hidden.
const SHOWN: Where = { visible: { not_equals: false } };
export const VISIBLE: Where = {
  and: [SHOWN, { "brand.visible": { not_equals: false } }, { "category.visible": { not_equals: false } }],
};

/** Same rule as VISIBLE, for a product already loaded with depth ≥ 1. */
export function isPublicProduct(p: { visible?: boolean | null; brand?: unknown; category?: unknown }) {
  const hidden = (rel: unknown) => typeof rel === "object" && rel !== null && (rel as { visible?: boolean | null }).visible === false;
  return p.visible !== false && !hidden(p.brand) && !hidden(p.category);
}

let payloadPromise: Promise<Payload> | null = null;

export function getPayloadClient(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

export async function getBrands(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "brands",
    locale,
    where: SHOWN,
    limit: 100,
    depth: 1,
  });
  return result.docs;
}

export async function getCategories(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "categories",
    locale,
    where: SHOWN,
    limit: 50,
  });
  return result.docs;
}

export async function getCategoryProductCounts() {
  const payload = await getPayloadClient();
  const categories = await payload.find({
    collection: "categories",
    where: SHOWN,
    limit: 50,
  });
  const counts: Record<string, number> = {};
  await Promise.all(
    categories.docs.map(async (cat) => {
      const res = await payload.count({
        collection: "products",
        where: { and: [{ category: { equals: cat.id } }, VISIBLE] },
      });
      counts[cat.id] = res.totalDocs;
    }),
  );
  return counts;
}

export async function getProducts(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    locale,
    where: VISIBLE,
    limit: 200,
    depth: 2,
  });
  return result.docs;
}

export async function getTestimonials(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "testimonials",
    locale,
    where: SHOWN,
    limit: 20,
  });
  return result.docs;
}

export async function getArticles(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "articles",
    locale,
    where: SHOWN,
    limit: 20,
  });
  return result.docs;
}

export async function getPromotions(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "promotions",
    locale,
    where: SHOWN,
    limit: 10,
  });
  return result.docs;
}

export async function getSiteSettings(locale: AppLocale) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings", locale });
}

export async function getHomepage(locale: AppLocale) {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "homepage", locale });
}

export async function getBrandBySlug(slug: string, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "brands",
    locale,
    where: { and: [{ slug: { equals: slug } }, SHOWN] },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] ?? null;
}

export async function getProductBySlug(slug: string, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    locale,
    where: { and: [{ slug: { equals: slug } }, VISIBLE] },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
}

export async function getCategoryBySlug(slug: string, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "categories",
    locale,
    where: { and: [{ slug: { equals: slug } }, SHOWN] },
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function getArticleBySlug(slug: string, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "articles",
    locale,
    where: { and: [{ slug: { equals: slug } }, SHOWN] },
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function getProductsByBrand(brandId: number, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    locale,
    where: { and: [{ brand: { equals: brandId } }, VISIBLE] },
    limit: 100,
    depth: 2,
  });
  return result.docs;
}

export async function getProductsByCategory(categoryId: number, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    locale,
    where: { and: [{ category: { equals: categoryId } }, VISIBLE] },
    limit: 100,
    depth: 2,
  });
  return result.docs;
}
