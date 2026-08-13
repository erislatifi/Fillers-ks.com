import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/Button";
import { ProductRow } from "@/components/ProductRow";
import { BrandBadge } from "@/components/media";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/icons";
import { getBrandBySlug, getProductsByBrand } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const brand = await getBrandBySlug(slug, locale as AppLocale);
  if (!brand) return {};
  return {
    title: brand.name,
    description: brand.description,
  };
}

export default async function BrandPage({ params }: Props) {
  const { locale, slug } = await params;
  const appLocale = locale as AppLocale;
  const brand = await getBrandBySlug(slug, appLocale);
  if (!brand) notFound();

  const products = await getProductsByBrand(brand.id, appLocale);
  const t = await getTranslations("brands");

  return (
    <>
      <section className="relative overflow-hidden bg-mist">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 90% 60% at 15% 0%, #fdeaf4 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, #eef0f6 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-[0.35]" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 sm:pt-20 pb-14 sm:pb-16">
          <div className="flex items-center gap-4">
            <BrandBadge
              name={brand.name}
              logo={brand.logo}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper border border-line text-xl font-display font-semibold text-accent-deep shrink-0 overflow-hidden"
            />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-ink-faint">{brand.origin}</p>
              {brand.type === "device" && (
                <span className="mt-1 inline-flex rounded-full bg-ink text-paper text-[9.5px] font-semibold tracking-wide px-2 py-0.5">
                  {t("device")}
                </span>
              )}
            </div>
          </div>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight text-ink text-balance">
            {brand.name}
          </h1>
          <p className="mt-3 text-[16px] sm:text-lg font-medium text-accent-deep">{brand.tagline}</p>
          <p className="mt-5 max-w-2xl text-[15px] sm:text-base leading-relaxed text-ink-soft">
            {brand.description}
          </p>

          {brand.distribution && (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-paper/70 px-4 py-1.5 text-[12px] font-medium tracking-wide text-accent-deep backdrop-blur-sm">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              {brand.distribution}
            </span>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="/contact" size="lg">
              {brand.type === "device" ? t("discover") + " · Request a Quote" : "Order This Brand"}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
            <Button href="/brands" variant="secondary" size="lg">
              {t("viewAll")}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1000px] px-6 lg:px-10">
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-10">
            {brand.name} — products
          </h2>
          {products.length > 0 ? (
            <div className="flex flex-col gap-5">
              {products.map((p) => (
                <ProductRow key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-ink-soft text-sm">No products published for this brand yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
