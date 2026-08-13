import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { ProductRow } from "@/components/ProductRow";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug, locale as AppLocale);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  const appLocale = locale as AppLocale;
  const category = await getCategoryBySlug(slug, appLocale);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id, appLocale);

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={category.description ?? undefined}
      />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1000px] px-6 lg:px-10">
          <p className="mb-8 text-[13px] text-ink-faint">
            {products.length} product{products.length === 1 ? "" : "s"} in {category.name}
          </p>
          {products.length > 0 ? (
            <div className="flex flex-col gap-5">
              {products.map((p) => (
                <ProductRow key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-ink-soft text-sm">
              No products published in this category yet — check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
