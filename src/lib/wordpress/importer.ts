import type { Payload } from "payload";
import { NEW_BRANDS, PRODUCT_MAP } from "./catalogMap";

// Copies the old WooCommerce shop (fillers-ks.com) into this catalog through its public
// Store API — no WordPress login or export needed. Runs in small batches so a slow host
// never times out, and is safe to re-run: products are matched by slug and images by their
// WordPress id, so nothing is duplicated.

export const WP_STORE_API = "https://fillers-ks.com/wp-json/wc/store/v1/products";
const IMAGES_PER_PRODUCT = 3;

type WpImage = { id: number; src: string; name?: string; alt?: string };
type WpProduct = {
  id: number;
  name: string;
  sku: string;
  short_description: string;
  description: string;
  prices: { price: string; regular_price: string; currency_minor_unit: number };
  on_sale: boolean;
  is_in_stock: boolean;
  low_stock_remaining: number | null;
  images: WpImage[];
};

export type ImportLine = { name: string; status: "created" | "updated" | "skipped" | "error"; note?: string };
export type ImportResult = { total: number; next: number | null; lines: ImportLine[] };

async function fetchWpProducts(): Promise<WpProduct[]> {
  const all: WpProduct[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${WP_STORE_API}?per_page=100&page=${page}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`WordPress u përgjigj me ${res.status}`);
    const batch = (await res.json()) as WpProduct[];
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all.filter((p) => PRODUCT_MAP[p.id]).sort((a, b) => a.id - b.id);
}

const ENTITIES: Record<string, string> = { "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&#039;": "'", "&lt;": "<", "&gt;": ">" };

/** WordPress HTML → plain text with bullets and line breaks (the description field is plain text). */
export function htmlToText(html: string): string {
  return html
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/(p|li|h\d|div|section)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e] ?? " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    // Keep list items together: no blank line before a bullet.
    .replace(/\n+(?=• )/g, "\n")
    .trim();
}

const money = (value: string, minor: number) => Number(value) / 10 ** (minor ?? 2);
const SIZE = /(\d+\s*[x×]\s*)?\d+(?:[.,]\d+)?\s*ml/i;

async function ensureBrands(payload: Payload) {
  const categories = await payload.find({ collection: "categories", limit: 100, depth: 0 });
  const catId = (slug: string) => categories.docs.find((c) => c.slug === slug)?.id;
  for (const b of NEW_BRANDS) {
    const exists = await payload.count({ collection: "brands", where: { slug: { equals: b.slug } } });
    if (exists.totalDocs) continue;
    await payload.create({
      collection: "brands",
      locale: "sq",
      data: {
        name: b.name,
        slug: b.slug,
        origin: b.origin,
        type: b.type,
        tagline: b.tagline,
        description: b.description,
        category: catId(b.category),
      },
    });
  }
}

/** Reuses an already-imported copy of a WordPress image, else downloads and uploads it. */
async function importImage(payload: Payload, img: WpImage, alt: string): Promise<number | null> {
  const prefix = `wp-${img.id}-`;
  const existing = await payload.find({ collection: "media", where: { filename: { like: prefix } }, limit: 1, depth: 0 });
  if (existing.docs[0]) return existing.docs[0].id;

  const res = await fetch(img.src);
  if (!res.ok) return null;
  const data = Buffer.from(await res.arrayBuffer());
  const base = decodeURIComponent(img.src.split("/").pop() ?? "image.jpg").replace(/[^a-zA-Z0-9._-]/g, "-");
  // The WordPress server sends some formats (e.g. .avif) as text/plain — trust the extension then.
  const header = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
  const ext = base.split(".").pop()?.toLowerCase() ?? "";
  const mimetype = header.startsWith("image/") ? header : MIME_BY_EXT[ext];
  if (!mimetype) return null;
  const media = await payload.create({
    collection: "media",
    data: { alt },
    file: { data, mimetype, name: `${prefix}${base}`, size: data.length },
  });
  return media.id;
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

async function importOne(payload: Payload, wp: WpProduct, ids: { brand: Map<string, number>; category: Map<string, number> }): Promise<ImportLine> {
  const map = PRODUCT_MAP[wp.id];
  const minor = wp.prices.currency_minor_unit;
  const price = money(wp.prices.price, minor);
  const regular = money(wp.prices.regular_price, minor);
  const description = htmlToText(wp.short_description) || htmlToText(wp.description).slice(0, 1500) || map.name;

  const found = await payload.find({ collection: "products", where: { slug: { equals: map.slug } }, limit: 1, depth: 0 });
  const existing = found.docs[0];

  // Keep images already imported from WordPress; replace demo/placeholder images.
  const existingIds = (existing?.images ?? []).map((m) => (typeof m === "object" ? m.id : m));
  const existingMedia = existingIds.length
    ? await payload.find({ collection: "media", where: { id: { in: existingIds } }, limit: 10, depth: 0 })
    : { docs: [] };
  const hasWpImages = existingMedia.docs.some((m) => m.filename?.startsWith("wp-"));
  let images = existingIds;
  if (!hasWpImages) {
    const imported: number[] = [];
    for (const img of wp.images.slice(0, IMAGES_PER_PRODUCT)) {
      // One broken picture shouldn't stop the product from being imported.
      const id = await importImage(payload, img, map.name).catch(() => null);
      if (id) imported.push(id);
    }
    if (imported.length) images = imported;
  }

  const data = {
    name: map.name,
    slug: map.slug,
    brand: ids.brand.get(map.brand)!,
    category: ids.category.get(map.category)!,
    size: map.name.match(SIZE)?.[0]?.replace(/\s+/g, " ") ?? undefined,
    price: price > 0 ? price : 0,
    compareAtPrice: wp.on_sale && regular > price ? regular : null,
    quoteOnly: price <= 0,
    stockStatus: !wp.is_in_stock ? "out_of_stock" : wp.low_stock_remaining ? "low_stock" : "in_stock",
    sku: wp.sku || undefined,
    description,
    images,
    visible: true,
  } as const;

  if (!data.brand || !data.category) return { name: map.name, status: "error", note: "brendi ose kategoria mungon" };

  if (existing) {
    await payload.update({ collection: "products", id: existing.id, locale: "sq", data });
    return { name: map.name, status: "updated", note: `${images.length} foto` };
  }
  await payload.create({ collection: "products", locale: "sq", data });
  return { name: map.name, status: "created", note: `${images.length} foto` };
}

/**
 * Imports products [offset, offset + size). The first batch also creates missing brands;
 * the last one optionally hides catalog products that aren't in WordPress (demo items).
 */
export async function importWordPressBatch(
  payload: Payload,
  { offset, size, hideOthers }: { offset: number; size: number; hideOthers: boolean },
): Promise<ImportResult> {
  if (offset === 0) await ensureBrands(payload);
  const products = await fetchWpProducts();

  const [brands, categories] = await Promise.all([
    payload.find({ collection: "brands", limit: 200, depth: 0 }),
    payload.find({ collection: "categories", limit: 100, depth: 0 }),
  ]);
  const ids = {
    brand: new Map(brands.docs.map((b) => [b.slug, b.id])),
    category: new Map(categories.docs.map((c) => [c.slug, c.id])),
  };

  const lines: ImportLine[] = [];
  for (const wp of products.slice(offset, offset + size)) {
    try {
      lines.push(await importOne(payload, wp, ids));
    } catch (err) {
      lines.push({ name: PRODUCT_MAP[wp.id].name, status: "error", note: err instanceof Error ? err.message : String(err) });
    }
  }

  const next = offset + size < products.length ? offset + size : null;
  if (next === null && hideOthers) {
    const keep = Object.values(PRODUCT_MAP).map((m) => m.slug);
    const others = await payload.find({
      collection: "products",
      where: { and: [{ slug: { not_in: keep } }, { visible: { not_equals: false } }] },
      limit: 500,
      depth: 0,
    });
    for (const p of others.docs) {
      await payload.update({ collection: "products", id: p.id, data: { visible: false } });
      lines.push({ name: p.name, status: "skipped", note: "u fsheh (s'është në WordPress)" });
    }
  }
  return { total: products.length, next, lines };
}
