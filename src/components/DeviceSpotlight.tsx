import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MediaFrame, DeviceGlyph, logoUrl } from "@/components/media";
import { ArrowRightIcon } from "@/components/icons";
import type { Brand } from "@/payload-types";
import type { SectionText } from "@/lib/homepage";

type Props = {
  heading?: SectionText;
  devices: Brand[];
};

const factsBySlug: Record<string, { sq: string[]; en: string[] }> = {
  jeisys: {
    sq: ["HIFU · RF · IPL · Laser", "70+ vende", "25 vjet R&D"],
    en: ["HIFU · RF · IPL · Laser", "70+ countries", "25 years of R&D"],
  },
  clarius: {
    sq: ["Wireless & portativ", "Modele AI FDA-cleared", "Gati për injektime të udhëhequra"],
    en: ["Wireless & portable", "FDA-cleared AI models", "Guided-injection ready"],
  },
};

const huesBySlug: Record<string, number> = { jeisys: 40, clarius: 30 };

/**
 * Homepage "Pajisjet": compact — the heading sits beside small partner cards instead of
 * above two big ones. Brands with a logo first; a light sweep runs across a card on hover.
 */
export async function DeviceSpotlight({ devices, heading }: Props) {
  const t = await getTranslations("devices");
  const locale = (await getLocale()) as "sq" | "en";
  const shown = devices.filter((d) => d.featured !== false).sort(
    (a, b) => Number(!logoUrl(a.logo)) - Number(!logoUrl(b.logo)) || a.name.localeCompare(b.name),
  );
  if (shown.length === 0) return null;

  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:px-10">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            <span className="h-px w-6 bg-accent-deep/60" />
            {heading?.eyebrow || t("eyebrow")}
          </span>
          <h2 className="font-display text-2xl leading-tight tracking-tight text-ink text-balance sm:text-[32px]">
            {heading?.title || t("title")}
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{heading?.description || t("description")}</p>
          <Link
            href="/category/lasers-devices"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-deep link-underline"
          >
            {t("explore")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {shown.map((d) => (
            <Link
              key={d.slug}
              href={`/brands/${d.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-line bg-paper p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-24px_rgba(156,22,104,0.3)] before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-accent/10 before:to-transparent before:opacity-0 before:transition-all before:duration-700 hover:before:left-full hover:before:opacity-100"
            >
              <div className="flex h-11 items-center justify-between gap-3">
                {logoUrl(d.logo) ? (
                  // Wordmark logos keep their own shape (a square frame would crop them).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl(d.logo)!} alt={d.name} className="h-9 w-auto max-w-[140px] object-contain object-left" />
                ) : (
                  <MediaFrame hue={huesBySlug[d.slug] ?? 36} className="h-11 w-11 shrink-0 rounded-xl">
                    <DeviceGlyph className="absolute inset-0 h-full w-full p-2 text-ink/60" />
                  </MediaFrame>
                )}
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[9.5px] font-semibold tracking-wide text-paper">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  {t("partnerBadge")}
                </span>
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{d.name}</h3>
              <p className="mt-1 text-[13px] font-medium leading-snug text-accent-deep line-clamp-2">{d.tagline}</p>

              {(factsBySlug[d.slug]?.[locale] ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {factsBySlug[d.slug][locale].map((f) => (
                    <span key={f} className="rounded-full border border-line-soft bg-mist px-2.5 py-1 text-[11px] text-ink-soft">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <span className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent-deep group-hover:opacity-100">
                {t("discover")} {d.name}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
