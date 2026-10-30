import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { BrandBadge } from "@/components/media";
import { ArrowRightIcon } from "@/components/icons";
import type { Brand } from "@/payload-types";
import type { SectionText } from "@/lib/homepage";

type Props = {
  heading?: SectionText;
  brands: Brand[];
};

export async function FeaturedBrands({ brands, heading }: Props) {
  const t = await getTranslations("brands");

  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading
            eyebrow={(heading?.eyebrow || t("eyebrow"))}
            title={(heading?.title || t("title"))}
            description={(heading?.description || t("description"))}
          />
          <Link
            href="/brands"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-accent-deep link-underline shrink-0"
          >
            {t("viewAll")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {brands.map((brand, i) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group relative rounded-2xl border border-line bg-paper p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_48px_-24px_rgba(156,22,104,0.24)]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between">
                <BrandBadge
                  name={brand.name}
                  logo={brand.logo}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-mist text-[13px] font-display font-semibold text-accent-deep transition-colors group-hover:bg-accent-pale overflow-hidden"
                />
                <span className="flex items-center gap-2">
                  {brand.type === "device" && (
                    <span className="rounded-full bg-ink text-paper text-[9.5px] font-semibold tracking-wide px-2 py-0.5">
                      {t("device")}
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-widest text-ink-faint">
                    {brand.origin}
                  </span>
                </span>
              </div>

              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {brand.name}
              </h3>
              <p className="mt-1 text-[13px] font-medium text-accent-deep">{brand.tagline}</p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft line-clamp-3">
                {brand.description}
              </p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                {t("discover")} {brand.name}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>

              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-accent/20 transition-all" />
            </Link>
          ))}
        </div>

        <Link
          href="/brands"
          className="sm:hidden mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent-deep"
        >
          {t("viewAll")} <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
