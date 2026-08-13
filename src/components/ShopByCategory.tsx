import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/payload-types";
import { SectionHeading } from "@/components/SectionHeading";
import {
  DropIcon,
  SparkleIcon,
  HairIcon,
  CellIcon,
  CannulaIcon,
  NeedleIcon,
  MesoIcon,
  ShieldIcon,
  LaserIcon,
  ArrowRightIcon,
} from "@/components/icons";

const iconMap = {
  drop: DropIcon,
  sparkle: SparkleIcon,
  hair: HairIcon,
  cell: CellIcon,
  cannula: CannulaIcon,
  needle: NeedleIcon,
  meso: MesoIcon,
  shield: ShieldIcon,
  laser: LaserIcon,
};

type Props = {
  categories: Category[];
  counts: Record<string, number>;
};

export async function ShopByCategory({ categories, counts }: Props) {
  const t = await getTranslations("categories");

  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          align="center"
          className="mx-auto"
        />

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative rounded-2xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-24px_rgba(156,22,104,0.22)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mist transition-colors group-hover:bg-accent-pale">
                  <Icon className="h-5 w-5 text-accent-deep" />
                </span>
                <h3 className="mt-5 text-[15px] font-medium text-ink">{cat.name}</h3>
                <p className="mt-1 text-[13px] text-ink-soft">{cat.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[12px] text-ink-faint">
                    {counts[String(cat.id)] ?? 0} {t("products")}
                  </span>
                  <ArrowRightIcon className="h-3.5 w-3.5 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent-deep" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
