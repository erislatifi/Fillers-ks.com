"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/payload-types";
import { MediaFrame, VialGlyph, DeviceGlyph, UploadedImage, mediaUrl, hueFromSlug } from "@/components/media";
import { Button } from "@/components/Button";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ArrowRightIcon } from "@/components/icons";

export function ProductRow({ product }: { product: Product }) {
  const t = useTranslations("bestSellers");
  const brand = typeof product.brand === "object" ? product.brand : null;
  const categorySlug = typeof product.category === "object" ? product.category.slug : "";
  const Glyph = categorySlug === "lasers-devices" ? DeviceGlyph : VialGlyph;
  const image = product.images?.[0];

  return (
    <div className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-line bg-paper p-5 sm:p-6">
      <Link href={`/products/${product.slug}`} className="shrink-0">
        <MediaFrame hue={hueFromSlug(product.slug)} className="h-40 w-40 sm:h-36 sm:w-36 rounded-xl border border-line">
          {mediaUrl(image) ? (
            <UploadedImage media={image} />
          ) : (
            <Glyph className="absolute inset-0 h-full w-full p-8 text-ink/55" />
          )}
          {product.bestSeller && (
            <span className="absolute top-2 left-2 rounded-full bg-ink text-paper text-[9.5px] font-semibold tracking-wide px-2 py-0.5">
              {t("badge")}
            </span>
          )}
          {product.newArrival && (
            <span className="absolute top-2 right-2 rounded-full bg-accent text-paper text-[9.5px] font-semibold tracking-wide px-2 py-0.5">
              {t("newBadge")}
            </span>
          )}
        </MediaFrame>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          {brand && (
            <Link
              href={`/brands/${brand.slug}`}
              className="text-[11.5px] uppercase tracking-wider text-accent-deep font-medium hover:underline"
            >
              {brand.name}
            </Link>
          )}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="mt-1 font-display text-lg text-ink hover:text-accent-deep transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.size && <p className="mt-0.5 text-[12.5px] text-ink-faint">{product.size}</p>}
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft line-clamp-2 max-w-xl">
            {product.description}
          </p>
        </div>

        <div className="flex sm:flex-col items-start sm:items-end gap-3 shrink-0">
          {!product.quoteOnly && (
            <p className="font-display text-lg text-ink">€{(product.price ?? 0).toFixed(2)}</p>
          )}
          {product.quoteOnly ? (
            <Button href="/contact">
              {t("requestQuote")}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <AddToCartButton
              slug={product.slug}
              name={product.name}
              brandName={brand?.name ?? ""}
              price={product.price ?? 0}
              image={mediaUrl(image)}
              size={product.size ?? undefined}
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
}
