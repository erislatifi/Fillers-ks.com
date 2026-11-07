import type { Payload } from "payload";
import type { ImportLine, ImportResult } from "../wordpress/importer";
import { PDF_BRANDS, PDF_PRODUCTS } from "./pdfList";

/**
 * Adds the supplier-list products (src/lib/catalog/pdfList.ts). Safe to re-run:
 * a product that is already live is left alone, so prices, photos and texts the
 * client has edited are never overwritten. Old hidden demo products with the same
 * slug are turned into the real product (price reset to "Kërko ofertë").
 */
export async function importPdfList(payload: Payload): Promise<ImportResult> {
  const lines: ImportLine[] = [];

  const categories = await payload.find({ collection: "categories", limit: 100, depth: 0 });
  const catId = new Map(categories.docs.map((c) => [c.slug, c.id]));

  for (const b of PDF_BRANDS) {
    const exists = await payload.count({ collection: "brands", where: { slug: { equals: b.slug } } });
    if (exists.totalDocs) continue;
    await payload.create({
      collection: "brands",
      locale: "sq",
      data: { name: b.name, slug: b.slug, origin: b.origin, type: b.type, tagline: b.tagline, description: b.description, category: catId.get(b.category) },
    });
    lines.push({ name: `Brendi ${b.name}`, status: "created" });
  }

  const brands = await payload.find({ collection: "brands", limit: 300, depth: 0 });
  const brandId = new Map(brands.docs.map((b) => [b.slug, b.id]));

  for (const p of PDF_PRODUCTS) {
    try {
      const brand = brandId.get(p.brand);
      const category = catId.get(p.category);
      if (!brand || !category) {
        lines.push({ name: p.name, status: "error", note: "brendi ose kategoria mungon" });
        continue;
      }
      const found = await payload.find({ collection: "products", where: { slug: { equals: p.slug } }, limit: 1, depth: 0 });
      const existing = found.docs[0];
      if (existing && existing.visible !== false) {
        lines.push({ name: p.name, status: "skipped", note: "ekziston — s'u prek" });
        continue;
      }
      const data = {
        name: p.name,
        slug: p.slug,
        brand,
        category,
        size: p.size,
        description: p.description,
        price: 0,
        compareAtPrice: null,
        quoteOnly: true,
        stockStatus: "in_stock" as const,
        visible: true,
      };
      if (existing) {
        await payload.update({ collection: "products", id: existing.id, locale: "sq", data });
        lines.push({ name: p.name, status: "updated", note: `nr. ${p.pdf} · produkti demo u bë real` });
      } else {
        await payload.create({ collection: "products", locale: "sq", data });
        lines.push({ name: p.name, status: "created", note: `nr. ${p.pdf}` });
      }
    } catch (err) {
      lines.push({ name: p.name, status: "error", note: err instanceof Error ? err.message : String(err) });
    }
  }

  return { total: PDF_PRODUCTS.length, next: null, lines };
}
