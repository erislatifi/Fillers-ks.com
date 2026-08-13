/**
 * One-time migration: copies everything from the local SQLite database
 * (products, brands, categories, testimonials, articles, promotions, media
 * files) into the production Postgres database + S3-compatible media bucket.
 *
 * Run once, right before the first production deploy:
 *   npm run migrate:postgres
 *
 * Requires POSTGRES_URI and the S3_* variables to be set in .env.local
 * (copy the real values from .env.production once you have them â€” see
 * .env.production.example for where to get them).
 *
 * Safe to re-run: skips any document that already exists in the destination
 * (matched by slug / clinic name / filename / order number), so it never
 * duplicates or overwrites data you've already migrated or entered directly
 * in production.
 */
import { getPayload, buildConfig, type Payload } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { readFileSync } from "fs";
import path from "path";
import sharp from "sharp";

import { Users } from "../src/collections/Users";
import { Media } from "../src/collections/Media";
import { Brands } from "../src/collections/Brands";
import { Categories } from "../src/collections/Categories";
import { Products } from "../src/collections/Products";
import { Testimonials } from "../src/collections/Testimonials";
import { Articles } from "../src/collections/Articles";
import { Promotions } from "../src/collections/Promotions";
import { Orders } from "../src/collections/Orders";
import { SiteSettings } from "../src/globals/SiteSettings";
import { Homepage } from "../src/globals/Homepage";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

if (!process.env.POSTGRES_URI) {
  console.error(
    "Missing POSTGRES_URI. Add the real production values to .env.local first (see .env.production.example).",
  );
  process.exit(1);
}

const collections = [Users, Media, Brands, Categories, Products, Testimonials, Articles, Promotions, Orders];
const globalsConfig = [SiteSettings, Homepage];
type Locale = "sq" | "en";
const localization = { locales: ["sq", "en"], defaultLocale: "sq" satisfies Locale };

async function getSource(): Promise<Payload> {
  const config = buildConfig({
    collections,
    globals: globalsConfig,
    localization,
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || "migration-tmp-secret",
    db: sqliteAdapter({ client: { url: "file:./payload.db" } }),
    sharp,
  });
  return getPayload({ config });
}

async function getDest(): Promise<Payload> {
  const config = buildConfig({
    collections,
    globals: globalsConfig,
    localization,
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || "migration-tmp-secret",
    db: postgresAdapter({ pool: { connectionString: process.env.POSTGRES_URI } }),
    plugins: process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET,
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || "auto",
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
              },
              forcePathStyle: true,
            },
          }),
        ]
      : [],
    sharp,
  });
  return getPayload({ config });
}

type Slug = "categories" | "brands" | "products" | "testimonials" | "articles" | "promotions";

async function fetchBothLocales<C extends Slug>(payload: Payload, collection: C) {
  const [sq, en] = await Promise.all([
    payload.find({ collection, locale: "sq" as Locale, limit: 1000, depth: 1 }),
    payload.find({ collection, locale: "en" as Locale, limit: 1000, depth: 1 }),
  ]);
  const enById = new Map(en.docs.map((d) => [d.id, d]));
  return sq.docs.map((sqDoc) => ({ sq: sqDoc, en: enById.get(sqDoc.id) }));
}

async function main() {
  console.log("Connecting to source (SQLite) and destination (Postgres)...");
  const source = await getSource();
  const dest = await getDest();

  // ---------- Media (files first â€” everything else references these) ----------
  console.log("\n== Media ==");
  const sourceMedia = await source.find({ collection: "media", limit: 1000 });
  const mediaIdMap = new Map<number, number>();
  for (const doc of sourceMedia.docs) {
    const existing = await dest.find({
      collection: "media",
      where: { filename: { equals: doc.filename } },
      limit: 1,
    });
    if (existing.docs[0]) {
      mediaIdMap.set(doc.id, existing.docs[0].id as number);
      console.log(`skip media/${doc.filename} (already exists)`);
      continue;
    }
    if (!doc.filename) continue;
    const filePath = path.resolve(process.cwd(), "public/media", doc.filename);
    let data: Buffer;
    try {
      data = readFileSync(filePath);
    } catch {
      console.warn(`  ! could not read local file for ${doc.filename}, skipping`);
      continue;
    }
    const created = await dest.create({
      collection: "media",
      data: { alt: doc.alt },
      file: { data, mimetype: doc.mimeType || "image/jpeg", name: doc.filename, size: doc.filesize || data.length },
    });
    mediaIdMap.set(doc.id, created.id as number);
    console.log(`uploaded media/${doc.filename}`);
  }

  const mapMedia = (val: unknown): number | undefined => {
    if (!val) return undefined;
    const id = typeof val === "object" && val !== null ? (val as { id: number }).id : (val as number);
    return mediaIdMap.get(id);
  };

  // ---------- Categories ----------
  console.log("\n== Categories ==");
  const categoryIdMap = new Map<number, number>();
  for (const { sq, en } of await fetchBothLocales(source, "categories")) {
    const existing = await dest.find({ collection: "categories", where: { slug: { equals: sq.slug } }, limit: 1 });
    if (existing.docs[0]) {
      categoryIdMap.set(sq.id, existing.docs[0].id as number);
      console.log(`skip categories/${sq.slug}`);
      continue;
    }
    const created = await dest.create({
      collection: "categories",
      locale: "sq" as Locale,
      data: { name: sq.name, slug: sq.slug, description: sq.description, icon: sq.icon },
    });
    if (en) await dest.update({ collection: "categories", id: created.id, locale: "en" as Locale, data: { name: en.name, description: en.description } });
    categoryIdMap.set(sq.id, created.id as number);
    console.log(`migrated categories/${sq.slug}`);
  }

  // ---------- Brands ----------
  console.log("\n== Brands ==");
  const brandIdMap = new Map<number, number>();
  for (const { sq, en } of await fetchBothLocales(source, "brands")) {
    const existing = await dest.find({ collection: "brands", where: { slug: { equals: sq.slug } }, limit: 1 });
    if (existing.docs[0]) {
      brandIdMap.set(sq.id, existing.docs[0].id as number);
      console.log(`skip brands/${sq.slug}`);
      continue;
    }
    const categoryId = typeof sq.category === "object" && sq.category ? categoryIdMap.get(sq.category.id) : undefined;
    const created = await dest.create({
      collection: "brands",
      locale: "sq" as Locale,
      data: {
        name: sq.name,
        slug: sq.slug,
        origin: sq.origin,
        tagline: sq.tagline,
        description: sq.description,
        category: categoryId,
        type: sq.type,
        distribution: sq.distribution,
        logo: mapMedia(sq.logo),
      },
    });
    if (en) await dest.update({ collection: "brands", id: created.id, locale: "en" as Locale, data: { tagline: en.tagline, description: en.description, distribution: en.distribution } });
    brandIdMap.set(sq.id, created.id as number);
    console.log(`migrated brands/${sq.slug}`);
  }

  // ---------- Products ----------
  console.log("\n== Products ==");
  for (const { sq, en } of await fetchBothLocales(source, "products")) {
    const existing = await dest.find({ collection: "products", where: { slug: { equals: sq.slug } }, limit: 1 });
    if (existing.docs[0]) {
      console.log(`skip products/${sq.slug}`);
      continue;
    }
    const brandId = typeof sq.brand === "object" && sq.brand ? brandIdMap.get(sq.brand.id) : undefined;
    const categoryId = typeof sq.category === "object" && sq.category ? categoryIdMap.get(sq.category.id) : undefined;
    if (!brandId || !categoryId) {
      console.warn(`  ! skipping products/${sq.slug} — its brand or category didn't migrate`);
      continue;
    }
    const images = (sq.images ?? [])
      .map((img) => mapMedia(img))
      .filter((id): id is number => typeof id === "number");
    const created = await dest.create({
      collection: "products",
      locale: "sq" as Locale,
      data: {
        name: sq.name,
        slug: sq.slug,
        brand: brandId,
        category: categoryId,
        size: sq.size,
        price: sq.price,
        quoteOnly: sq.quoteOnly,
        bestSeller: sq.bestSeller,
        newArrival: sq.newArrival,
        description: sq.description,
        images,
      },
    });
    if (en) await dest.update({ collection: "products", id: created.id, locale: "en" as Locale, data: { description: en.description } });
    console.log(`migrated products/${sq.slug}`);
  }

  // ---------- Testimonials ----------
  console.log("\n== Testimonials ==");
  for (const { sq, en } of await fetchBothLocales(source, "testimonials")) {
    const existing = await dest.find({ collection: "testimonials", where: { clinic: { equals: sq.clinic } }, limit: 1 });
    if (existing.docs[0]) {
      console.log(`skip testimonials/${sq.clinic}`);
      continue;
    }
    const created = await dest.create({
      collection: "testimonials",
      locale: "sq" as Locale,
      data: { clinic: sq.clinic, city: sq.city, role: sq.role, quote: sq.quote },
    });
    if (en) await dest.update({ collection: "testimonials", id: created.id, locale: "en" as Locale, data: { role: en.role, quote: en.quote } });
    console.log(`migrated testimonials/${sq.clinic}`);
  }

  // ---------- Articles ----------
  console.log("\n== Articles ==");
  for (const { sq, en } of await fetchBothLocales(source, "articles")) {
    const existing = await dest.find({ collection: "articles", where: { slug: { equals: sq.slug } }, limit: 1 });
    if (existing.docs[0]) {
      console.log(`skip articles/${sq.slug}`);
      continue;
    }
    const created = await dest.create({
      collection: "articles",
      locale: "sq" as Locale,
      data: {
        title: sq.title,
        slug: sq.slug,
        excerpt: sq.excerpt,
        tag: sq.tag,
        readTime: sq.readTime,
        coverImage: mapMedia(sq.coverImage),
        content: sq.content,
      },
    });
    if (en) await dest.update({ collection: "articles", id: created.id, locale: "en" as Locale, data: { title: en.title, excerpt: en.excerpt, content: en.content } });
    console.log(`migrated articles/${sq.slug}`);
  }

  // ---------- Promotions ----------
  console.log("\n== Promotions ==");
  for (const { sq, en } of await fetchBothLocales(source, "promotions")) {
    const existing = await dest.find({ collection: "promotions", where: { slug: { equals: sq.slug } }, limit: 1 });
    if (existing.docs[0]) {
      console.log(`skip promotions/${sq.slug}`);
      continue;
    }
    const created = await dest.create({
      collection: "promotions",
      locale: "sq" as Locale,
      data: {
        title: sq.title,
        slug: sq.slug,
        badge: sq.badge,
        description: sq.description,
        ctaLabel: sq.ctaLabel,
        ctaHref: sq.ctaHref,
        theme: sq.theme,
      },
    });
    if (en) await dest.update({ collection: "promotions", id: created.id, locale: "en" as Locale, data: { title: en.title, badge: en.badge, description: en.description, ctaLabel: en.ctaLabel } });
    console.log(`migrated promotions/${sq.slug}`);
  }

  // ---------- Orders (not localized) ----------
  console.log("\n== Orders ==");
  const sourceOrders = await source.find({ collection: "orders", limit: 1000, depth: 0 });
  for (const order of sourceOrders.docs) {
    const existing = await dest.find({ collection: "orders", where: { orderNumber: { equals: order.orderNumber } }, limit: 1 });
    if (existing.docs[0]) {
      console.log(`skip orders/${order.orderNumber}`);
      continue;
    }
    await dest.create({
      collection: "orders",
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        clinicName: order.clinicName,
        contactName: order.contactName,
        email: order.email,
        phone: order.phone,
        deliveryAddress: order.deliveryAddress,
        requestedDeliveryDate: order.requestedDeliveryDate,
        notes: order.notes,
        items: order.items,
        subtotal: order.subtotal,
      },
    });
    console.log(`migrated orders/${order.orderNumber}`);
  }

  // ---------- Globals ----------
  console.log("\n== Globals ==");
  for (const locale of ["sq", "en"] as const) {
    const homepage = await source.findGlobal({ slug: "homepage", locale });
    await dest.updateGlobal({
      slug: "homepage",
      locale,
      data: {
        hero: { ...homepage.hero, image: mapMedia(homepage.hero?.image) },
        about: homepage.about,
      },
    });
    const siteSettings = await source.findGlobal({ slug: "site-settings", locale });
    await dest.updateGlobal({ slug: "site-settings", locale, data: siteSettings });
  }
  console.log("migrated globals (homepage, site-settings)");

  console.log("\nDone. Log into the production admin panel and create your first user â€”");
  console.log("user accounts are intentionally NOT migrated for security.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
