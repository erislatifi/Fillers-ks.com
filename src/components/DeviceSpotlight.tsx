import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { MediaFrame, DeviceGlyph, UploadedImage, mediaUrl } from "@/components/media";
import { ArrowRightIcon } from "@/components/icons";
import type { Brand } from "@/payload-types";

type Props = {
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

export async function DeviceSpotlight({ devices }: Props) {
  const t = await getTranslations("devices");
  const locale = (await getLocale()) as "sq" | "en";

  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
          <Link
            href="/category/lasers-devices"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-accent-deep link-underline shrink-0"
          >
            {t("explore")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {devices.map((d) => (
            <Link
              key={d.slug}
              href={`/brands/${d.slug}`}
              className="group rounded-3xl border border-line bg-paper p-8 sm:p-10 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_48px_-24px_rgba(156,22,104,0.24)]"
            >
              <div className="flex items-start justify-between gap-4">
                <MediaFrame hue={huesBySlug[d.slug] ?? 36} className="h-16 w-16 rounded-2xl shrink-0">
                  {mediaUrl(d.logo) ? (
                    <UploadedImage media={d.logo} className="p-2 object-contain" />
                  ) : (
                    <DeviceGlyph className="absolute inset-0 h-full w-full p-3 text-ink/60" />
                  )}
                </MediaFrame>
                <span className="mt-1 rounded-full bg-ink text-paper text-[10px] font-semibold tracking-wide px-2.5 py-1 shrink-0">
                  {t("partnerBadge")}
                </span>
              </div>

              <h3 className="mt-6 font-display text-2xl font-semibold text-ink">{d.name}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-ink-faint">{d.origin}</p>
              <p className="mt-3 text-[14px] font-medium text-accent-deep">{d.tagline}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{d.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {(factsBySlug[d.slug]?.[locale] ?? []).map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-mist border border-line-soft px-3 py-1.5 text-[12px] text-ink-soft"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                {t("discover")} {d.name}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/category/lasers-devices"
          className="sm:hidden mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent-deep"
        >
          {t("explore")} <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
