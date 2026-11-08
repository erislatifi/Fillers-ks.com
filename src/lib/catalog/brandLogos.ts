import fs from "fs";
import path from "path";
import type { Payload } from "payload";
import type { ImportLine, ImportResult } from "../wordpress/importer";

// Official brand logos collected from the brands' own websites (2026-11-07), stored in
// assets/brand-logos/<brand-slug>.png. A brand that already has a logo is never touched,
// so a logo the client uploads by hand always wins. Safe to re-run.
const DIR = path.join(process.cwd(), "assets", "brand-logos");

export function bundledLogoSlugs(): string[] {
  try {
    return fs.readdirSync(DIR).filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, ""));
  } catch {
    return [];
  }
}

export async function importBrandLogos(payload: Payload): Promise<ImportResult> {
  const lines: ImportLine[] = [];
  const slugs = bundledLogoSlugs();
  for (const slug of slugs) {
    const found = await payload.find({ collection: "brands", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
    const brand = found.docs[0];
    if (!brand) {
      lines.push({ name: slug, status: "skipped", note: "brendi s'ekziston" });
      continue;
    }
    if (brand.logo) {
      lines.push({ name: brand.name, status: "skipped", note: "ka logo — s'u prek" });
      continue;
    }
    try {
      const filename = `logo-${slug}.png`;
      const existing = await payload.find({ collection: "media", where: { filename: { like: `logo-${slug}` } }, limit: 1, depth: 0 });
      let mediaId = existing.docs[0]?.id;
      if (!mediaId) {
        const data = fs.readFileSync(path.join(DIR, `${slug}.png`));
        const media = await payload.create({
          collection: "media",
          data: { alt: `${brand.name} logo` },
          file: { data, mimetype: "image/png", name: filename, size: data.length },
        });
        mediaId = media.id;
      }
      await payload.update({ collection: "brands", id: brand.id, data: { logo: mediaId } });
      lines.push({ name: brand.name, status: "created", note: "logoja u vendos" });
    } catch (err) {
      lines.push({ name: brand.name, status: "error", note: err instanceof Error ? err.message : String(err) });
    }
  }
  return { total: slugs.length, next: null, lines };
}
