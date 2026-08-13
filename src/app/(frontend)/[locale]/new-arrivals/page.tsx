import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "New Arrivals" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewArrivalsPage({ params }: Props) {
  const { locale } = await params;
  const appLocale = locale as AppLocale;
  const products = (await getProducts(appLocale)).filter((p) => p.newArrival);
  const t = await getTranslations("newArrivals");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} className="w-full" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
