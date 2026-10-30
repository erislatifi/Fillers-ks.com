import type { Homepage } from "@/payload-types";

/** Admin overrides for a section heading; empty fields fall back to the built-in copy. */
export type SectionText = { eyebrow?: string | null; title?: string | null; description?: string | null };

export const SECTION_KEYS = [
  "brands",
  "about",
  "devices",
  "bestSellers",
  "categories",
  "why",
  "newArrivals",
  "education",
  "promotions",
  "testimonials",
  "instagram",
  "newsletter",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

/**
 * The homepage sections in the order the admin arranged them (Ballina → Seksionet),
 * without the switched-off ones. Sections missing from the admin list keep their default
 * position at the end, so a newly added section type shows up until it's configured.
 */
export function resolveSections(homepage: Homepage): { key: SectionKey; heading: SectionText }[] {
  const configured = (homepage.sections ?? []).filter((s): s is typeof s & { section: SectionKey } =>
    SECTION_KEYS.includes(s.section as SectionKey),
  );
  const seen = new Set(configured.map((s) => s.section));
  return [
    ...configured
      .filter((s) => s.enabled !== false)
      .map((s) => ({ key: s.section, heading: { eyebrow: s.eyebrow, title: s.title, description: s.description } })),
    ...SECTION_KEYS.filter((k) => !seen.has(k)).map((key) => ({ key, heading: {} })),
  ];
}
