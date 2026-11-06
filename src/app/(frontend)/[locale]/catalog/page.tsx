import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getCategories, getBrands } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";
import type { Product } from "@/payload-types";

export const metadata = { title: "Shop" };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; category?: string; brand?: string }>;
};

const slugOf = (rel: Product["brand"] | Product["category"]) => (typeof rel === "object" && rel ? rel.slug : "");

type Facet = { slug: string; name: string; count: number };

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { filter, category, brand } = await searchParams;
  const appLocale = locale as AppLocale;
  const t = await getTranslations({ locale: appLocale, namespace: "catalogPage" });

  const [allProducts, categories, brands] = await Promise.all([
    getProducts(appLocale),
    getCategories(appLocale),
    getBrands(appLocale),
  ]);

  let base = allProducts;
  if (filter === "best-sellers") base = base.filter((p) => p.bestSeller);
  if (filter === "new-arrivals") base = base.filter((p) => p.newArrival);

  const inCategory = category ? base.filter((p) => slugOf(p.category) === category) : base;
  const inBrand = brand ? base.filter((p) => slugOf(p.brand) === brand) : base;
  const products = brand ? inCategory.filter((p) => slugOf(p.brand) === brand) : inCategory;

  // Each list counts products within the other filter, and hides empty entries
  // (e.g. brands whose products are all hidden) unless that entry is selected.
  const facets = (items: { slug: string; name: string }[], pool: Product[], key: "brand" | "category", selected?: string): Facet[] =>
    items
      .map((i) => ({ slug: i.slug, name: i.name, count: pool.filter((p) => slugOf(p[key]) === i.slug).length }))
      .filter((f) => f.count > 0 || f.slug === selected);
  const categoryFacets = facets(categories, inBrand, "category", category);
  const brandFacets = facets(brands, inCategory, "brand", brand).sort((a, b) => a.name.localeCompare(b.name));

  const hrefFor = (overrides: { category?: string | null; brand?: string | null }) => {
    const qs = new URLSearchParams();
    if (filter) qs.set("filter", filter);
    const nextCategory = overrides.category !== undefined ? overrides.category : category;
    const nextBrand = overrides.brand !== undefined ? overrides.brand : brand;
    if (nextCategory) qs.set("category", nextCategory);
    if (nextBrand) qs.set("brand", nextBrand);
    const s = qs.toString();
    return s ? `/catalog?${s}` : "/catalog";
  };

  const groups = [
    { key: "category" as const, label: t("category"), items: categoryFacets, selected: category, total: inBrand.length },
    { key: "brand" as const, label: t("brand"), items: brandFacets, selected: brand, total: inCategory.length },
  ];

  const chip = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
      active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft hover:border-accent"
    }`;
  const row = (active: boolean) =>
    `flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-[13.5px] transition-colors ${
      active ? "bg-ink text-paper font-medium" : "text-ink-soft hover:bg-mist hover:text-ink"
    }`;

  return (
    <>
      <PageHero compact eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="bg-paper py-8 sm:py-10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          {/* Desktop: filters in a sidebar that stays in view while scrolling. */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-7">
              {groups.map((g) => (
                <div key={g.key}>
                  <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">{g.label}</p>
                  <ul className={`space-y-0.5 ${g.key === "brand" ? "max-h-[46vh] overflow-y-auto pr-1" : ""}`}>
                    <li>
                      <Link href={hrefFor({ [g.key]: null })} className={row(!g.selected)}>
                        <span>{t("all")}</span>
                        <span className="text-[11.5px] opacity-60">{g.total}</span>
                      </Link>
                    </li>
                    {g.items.map((f) => (
                      <li key={f.slug}>
                        <Link href={hrefFor({ [g.key]: f.slug })} className={row(g.selected === f.slug)}>
                          <span className="truncate">{f.name}</span>
                          <span className="text-[11.5px] opacity-60">{f.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            {/* Mobile/tablet: one scrollable row of chips per filter. */}
            <div className="mb-5 space-y-3 lg:hidden">
              {groups.map((g) => (
                <div key={g.key} className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
                  <Link href={hrefFor({ [g.key]: null })} className={chip(!g.selected)}>
                    {g.label}: {t("all")}
                  </Link>
                  {g.items.map((f) => (
                    <Link key={f.slug} href={hrefFor({ [g.key]: f.slug })} className={chip(g.selected === f.slug)}>
                      {f.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <p className="mb-5 text-[13px] text-ink-faint">
              {t("count", { count: products.length })}
              {(category || brand) && (
                <>
                  {" · "}
                  <Link href={hrefFor({ category: null, brand: null })} className="underline hover:text-accent-deep">
                    {t("clearFilters")}
                  </Link>
                </>
              )}
            </p>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} compact className="w-full" />
                ))}
              </div>
            ) : (
              <p className="text-ink-soft text-sm">{t("empty")}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
