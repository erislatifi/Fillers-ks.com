import { getTranslations } from "next-intl/server";
import type { Product } from "@/payload-types";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { Rail } from "@/components/Rail";
import { Button } from "@/components/Button";
import type { SectionText } from "@/lib/homepage";

type Props = {
  heading?: SectionText;
  products: Product[];
};

export async function BestSellers({ products, heading }: Props) {
  const t = await getTranslations("bestSellers");

  return (
    <section className="bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading
            eyebrow={(heading?.eyebrow || t("eyebrow"))}
            title={(heading?.title || t("title"))}
            description={(heading?.description || t("description"))}
          />
        </div>

        <div className="mt-14">
          <Rail>
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Rail>
        </div>

        <div className="mt-10 flex justify-center sm:justify-start">
          <Button href="/catalog?filter=best-sellers" variant="secondary">
            {t("browseAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}
