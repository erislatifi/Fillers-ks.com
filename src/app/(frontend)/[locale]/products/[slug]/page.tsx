import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/Button";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { Rail } from "@/components/Rail";
import { MediaFrame, VialGlyph, DeviceGlyph, UploadedImage, mediaUrl, hueFromSlug } from "@/components/media";
import { ArrowRightIcon, ShieldCheckIcon, TruckIcon } from "@/components/icons";
import { Badge } from "@/components/Badge";
import { getProductBySlug, getProductsByBrand } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as AppLocale);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const appLocale = locale as AppLocale;
  const product = await getProductBySlug(slug, appLocale);
  if (!product) notFound();

  const brand = typeof product.brand === "object" ? product.brand : null;
  const category = typeof product.category === "object" ? product.category : null;
  const t = await getTranslations("bestSellers");
  const tp = await getTranslations("productPage");
  const ts = await getTranslations("stock");
  const onSale = !product.quoteOnly && !!product.compareAtPrice && product.compareAtPrice > (product.price ?? 0);
  const Glyph = category?.slug === "lasers-devices" ? DeviceGlyph : VialGlyph;
  const images = (product.images ?? []).filter((img) => mediaUrl(img));

  const related = brand ? await getProductsByBrand(brand.id, appLocale) : [];
  const relatedFiltered = related.filter((p) => p.slug !== product.slug).slice(0, 6);

  return (
    <>
      <section className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex items-center gap-2 text-[13px] text-ink-faint mb-8">
            {brand && (
              <>
                <Link href={`/brands/${brand.slug}`} className="hover:text-accent-deep transition-colors">
                  {brand.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-ink">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12">
            <div>
              <MediaFrame hue={hueFromSlug(product.slug)} className="aspect-square rounded-3xl border border-line">
                {images.length > 0 ? (
                  <UploadedImage media={images[0]} />
                ) : (
                  <Glyph className="absolute inset-0 h-full w-full p-16 text-ink/55" />
                )}
                {product.bestSeller && (
                  <Badge variant="dark" className="absolute top-4 left-4">
                    {t("badge")}
                  </Badge>
                )}
                {product.newArrival && (
                  <Badge variant="accent" className="absolute top-4 right-4">
                    {t("newBadge")}
                  </Badge>
                )}
              </MediaFrame>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.slice(1, 5).map((img, i) => (
                    <MediaFrame key={i} hue={hueFromSlug(product.slug)} className="aspect-square rounded-xl border border-line">
                      <UploadedImage media={img} />
                    </MediaFrame>
                  ))}
                </div>
              )}
            </div>

            <div>
              {brand && (
                <p className="text-[12px] uppercase tracking-widest text-accent-deep font-medium">
                  {brand.name}
                </p>
              )}
              <h1 className="mt-2 font-display text-3xl sm:text-4xl text-ink text-balance">
                {product.name}
              </h1>
              {product.size && <p className="mt-2 text-[14px] text-ink-faint">{product.size}</p>}

              <p className="mt-6 font-display text-2xl text-ink">
                {product.quoteOnly ? t("requestQuote") : `€${(product.price ?? 0).toFixed(2)}`}
                {onSale && (
                  <span className="ml-3 text-[17px] text-ink-faint line-through">€{product.compareAtPrice!.toFixed(2)}</span>
                )}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                <span
                  className={
                    product.stockStatus === "out_of_stock"
                      ? "text-red-700"
                      : product.stockStatus === "low_stock" || product.stockStatus === "preorder"
                        ? "text-amber-700"
                        : "text-emerald-700"
                  }
                >
                  ● {ts(product.stockStatus ?? "in_stock")}
                </span>
                {product.sku && (
                  <span className="text-ink-faint">
                    {ts("sku")}: {product.sku}
                  </span>
                )}
              </p>

              <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {product.stockStatus === "out_of_stock" && !product.quoteOnly ? (
                  <span className="inline-flex items-center rounded-full border border-line px-6 py-4 text-[15px] text-ink-faint">
                    {ts("outOfStockButton")}
                  </span>
                ) : product.quoteOnly ? (
                  <Button href="/contact" size="lg">
                    {t("requestQuote")}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <AddToCartButton
                    slug={product.slug}
                    name={product.name}
                    brandName={brand?.name ?? ""}
                    price={product.price ?? 0}
                    image={images[0] ? mediaUrl(images[0]) : null}
                    size={product.size ?? undefined}
                  />
                )}
                {category && (
                  <Button href={`/category/${category.slug}`} variant="secondary" size="lg">
                    {category.name}
                  </Button>
                )}
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
                <TruckIcon className="h-4 w-4 text-accent-deep" />
                {tp("deliveryEstimate")}
              </p>

              <div className="mt-10 rounded-2xl border border-line bg-mist p-5 flex items-start gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-accent-deep shrink-0 mt-0.5" />
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  Available exclusively to licensed medical professionals and certified aesthetic
                  clinics. Contact us to verify your account and place an order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedFiltered.length > 0 && (
        <section className="bg-mist py-16 sm:py-20">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <h2 className="font-display text-2xl sm:text-3xl text-ink mb-10">
              More from {brand?.name}
            </h2>
            <Rail>
              {relatedFiltered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </Rail>
          </div>
        </section>
      )}
    </>
  );
}
