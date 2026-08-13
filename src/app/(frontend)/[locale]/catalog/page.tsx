import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getCategories, getBrands } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Shop" };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; category?: string; brand?: string }>;
};

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { filter, category, brand } = await searchParams;
  const appLocale = locale as AppLocale;

  const [allProducts, categories, brands] = await Promise.all([
    getProducts(appLocale),
    getCategories(appLocale),
    getBrands(appLocale),
  ]);

  let products = allProducts;
  if (filter === "best-sellers") products = products.filter((p) => p.bestSeller);
  if (filter === "new-arrivals") products = products.filter((p) => p.newArrival);
  if (category) {
    products = products.filter(
      (p) => typeof p.category === "object" && p.category.slug === category,
    );
  }
  if (brand) {
    products = products.filter(
      (p) => typeof p.brand === "object" && p.brand.slug === brand,
    );
  }

  const hrefFor = (overrides: { category?: string | null; brand?: string | null }) => {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);

    const nextCategory = overrides.category !== undefined ? overrides.category : category;
    const nextBrand = overrides.brand !== undefined ? overrides.brand : brand;

    if (nextCategory) params.set("category", nextCategory);
    if (nextBrand) params.set("brand", nextBrand);

    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  return (
    <>
      <PageHero
        eyebrow="Shop"
        title="Full product catalog"
        description="Browse the complete range of dermal fillers, skin boosters, biostimulators and aesthetic devices — filter by category or brand."
      />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="mb-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={hrefFor({ category: null })}
                className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                  !category ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-accent"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={hrefFor({ category: c.slug })}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    category === c.slug
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink-soft hover:border-accent"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Brand
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={hrefFor({ brand: null })}
                className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                  !brand ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-accent"
                }`}
              >
                All
              </Link>
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={hrefFor({ brand: b.slug })}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    brand === b.slug
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink-soft hover:border-accent"
                  }`}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          <p className="mb-6 text-[13px] text-ink-faint">
            {products.length} product{products.length === 1 ? "" : "s"}
            {(category || brand) && (
              <>
                {" "}
                ·{" "}
                <Link href="/catalog" className="underline hover:text-accent-deep">
                  clear filters
                </Link>
              </>
            )}
          </p>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} className="w-full" />
              ))}
            </div>
          ) : (
            <p className="text-ink-soft text-sm">No products match this filter.</p>
          )}
        </div>
      </section>
    </>
  );
}
