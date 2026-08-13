import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import type { AppLocale } from "@/i18n/routing";

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
    limit: 50,
  });
  return result.docs;
}

export async function getCategoryProductCounts() {
  const payload = await getPayloadClient();
  const categories = await payload.find({
    collection: "categories",
    limit: 50,
  });
  const counts: Record<string, number> = {};
  await Promise.all(
    categories.docs.map(async (cat) => {
      const res = await payload.count({
        collection: "products",
        where: { category: { equals: cat.id } },
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
    limit: 20,
  });
  return result.docs;
}

export async function getArticles(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "articles",
    locale,
    limit: 20,
  });
  return result.docs;
}

export async function getPromotions(locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "promotions",
    locale,
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
    where: { slug: { equals: slug } },
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
    where: { slug: { equals: slug } },
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
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function getArticleBySlug(slug: string, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "articles",
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function getProductsByBrand(brandId: number, locale: AppLocale) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    locale,
    where: { brand: { equals: brandId } },
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
    where: { category: { equals: categoryId } },
    limit: 100,
    depth: 2,
  });
  return result.docs;
}
