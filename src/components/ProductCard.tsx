"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Product } from "@/payload-types";
import { MediaFrame, VialGlyph, DeviceGlyph, UploadedImage, mediaUrl, hueFromSlug } from "@/components/media";
import { HeartIcon, BagIcon } from "@/components/icons";
import { Badge } from "@/components/Badge";
import { useCart } from "@/contexts/CartContext";

type Props = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className = "w-[240px] sm:w-[268px] shrink-0" }: Props) {
  const t = useTranslations("bestSellers");
  const ts = useTranslations("stock");
  const outOfStock = product.stockStatus === "out_of_stock";
  const onSale = !product.quoteOnly && !!product.compareAtPrice && product.compareAtPrice > (product.price ?? 0);
  const { addItem } = useCart();
  const brandName = typeof product.brand === "object" ? product.brand.name : "";
  const categorySlug = typeof product.category === "object" ? product.category.slug : "";
  const Glyph = categorySlug === "lasers-devices" ? DeviceGlyph : VialGlyph;
  const image = product.images?.[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.quoteOnly || outOfStock) return;
    addItem({
      slug: product.slug,
      name: product.name,
      brandName,
      price: product.price ?? 0,
      image: mediaUrl(image),
      size: product.size ?? undefined,
    });
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group block ${className}`}
    >
      <div className="relative">
        <MediaFrame hue={hueFromSlug(product.slug)} className="aspect-[4/5] rounded-2xl border border-line">
          {image ? (
            <UploadedImage
              media={image}
              className="transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <Glyph className="absolute inset-0 h-full w-full p-10 text-ink/60 transition-transform duration-500 group-hover:scale-[1.04]" />
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.bestSeller && <Badge variant="dark">{t("badge")}</Badge>}
            {product.newArrival && <Badge variant="accent">{t("newBadge")}</Badge>}
            {onSale && <Badge variant="accent">−{Math.round((1 - (product.price ?? 0) / product.compareAtPrice!) * 100)}%</Badge>}
            {(outOfStock || product.stockStatus === "preorder") && (
              <Badge variant="dark">{ts(product.stockStatus!)}</Badge>
            )}
          </div>

          <button
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-paper/85 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:text-accent-deep"
          >
            <HeartIcon className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <span className="flex items-center justify-center gap-2 rounded-full bg-paper/95 backdrop-blur-sm py-2.5 text-[12.5px] font-medium text-ink shadow-sm">
              {t("quickView")}
            </span>
          </div>
        </MediaFrame>

        {!product.quoteOnly && !outOfStock && (
          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            className="absolute -bottom-4 right-4 h-11 w-11 rounded-full bg-ink text-paper flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:bg-accent-deep"
          >
            <BagIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-6 px-0.5">
        <p className="text-[11.5px] uppercase tracking-wider text-accent-deep font-medium">
          {brandName}
        </p>
        <h3 className="mt-1 text-[15px] font-medium text-ink">{product.name}</h3>
        <p className="mt-0.5 text-[12.5px] text-ink-faint">{product.size}</p>
        <p className="mt-2 font-display text-[15px] text-ink">
          {product.quoteOnly ? t("requestQuote") : `€${(product.price ?? 0).toFixed(2)}`}
          {onSale && (
            <span className="ml-2 text-[13px] text-ink-faint line-through">€{product.compareAtPrice!.toFixed(2)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
