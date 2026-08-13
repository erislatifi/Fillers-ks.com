import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/payload-types";
import { SectionHeading } from "@/components/SectionHeading";
import { MediaFrame, VialGlyph, DeviceGlyph, UploadedImage, hueFromSlug } from "@/components/media";
import { Rail } from "@/components/Rail";
import { ArrowRightIcon } from "@/components/icons";

type Props = {
  products: Product[];
};

export async function NewArrivals({ products }: Props) {
  const t = await getTranslations("newArrivals");

  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
          <Link
            href="/new-arrivals"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-accent-deep link-underline shrink-0"
          >
            {t("viewAll")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14">
          <Rail>
            {products.map((p) => {
              const categorySlug = typeof p.category === "object" ? p.category.slug : "";
              const brandName = typeof p.brand === "object" ? p.brand.name : "";
              const Glyph = categorySlug === "lasers-devices" ? DeviceGlyph : VialGlyph;
              const image = p.images?.[0];
              return (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group block w-[300px] sm:w-[360px] shrink-0"
                >
                  <MediaFrame
                    hue={hueFromSlug(p.slug)}
                    className="aspect-[16/11] rounded-3xl border border-line"
                  >
                    {image ? (
                      <UploadedImage
                        media={image}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Glyph className="absolute inset-0 h-full w-full p-10 text-ink/55 transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <span className="absolute top-4 left-4 rounded-full bg-accent text-paper text-[10px] font-semibold tracking-wide px-2.5 py-1">
                      {t("badge")}
                    </span>
                    <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-accent-deep font-medium">
                          {brandName}
                        </p>
                        <h3 className="mt-1 font-display text-lg text-ink">{p.name}</h3>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-0.5">
                        <ArrowRightIcon className="h-4 w-4 text-ink" />
                      </span>
                    </div>
                  </MediaFrame>
                </Link>
              );
            })}
          </Rail>
        </div>
      </div>
    </section>
  );
}
