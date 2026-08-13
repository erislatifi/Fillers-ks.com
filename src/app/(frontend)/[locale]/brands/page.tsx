import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { BrandBadge } from "@/components/media";
import { ArrowRightIcon } from "@/components/icons";
import { getBrands } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Brands" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  const appLocale = locale as AppLocale;
  const brands = await getBrands(appLocale);
  const t = await getTranslations("brands");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group relative rounded-2xl border border-line bg-paper p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_48px_-24px_rgba(156,22,104,0.24)]"
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
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{brand.name}</h3>
                <p className="mt-1 text-[13px] font-medium text-accent-deep">{brand.tagline}</p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft line-clamp-3">
                  {brand.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  {t("discover")} {brand.name}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
