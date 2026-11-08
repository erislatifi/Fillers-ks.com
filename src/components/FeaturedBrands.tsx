import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { logoUrl } from "@/components/media";
import { ArrowRightIcon } from "@/components/icons";
import type { Brand } from "@/payload-types";
import type { SectionText } from "@/lib/homepage";

type Props = {
  heading?: SectionText;
  brands: Brand[];
};

/**
 * Homepage brands: one slowly scrolling strip of logos (pauses on hover) instead of a grid
 * of big cards. Only brands ticked "Shfaqe në ballinë" in the admin; brands with a logo first.
 */
export async function FeaturedBrands({ brands, heading }: Props) {
  const t = await getTranslations("brands");
  const shown = brands
    .filter((b) => b.featured !== false)
    .sort((a, b) => Number(!logoUrl(a.logo)) - Number(!logoUrl(b.logo)) || a.name.localeCompare(b.name));
  if (shown.length === 0) return null;

  // ~3s per brand keeps the speed the same however many there are.
  const duration = `${Math.max(20, shown.length * 3)}s`;

  const tile = (brand: Brand, key: string, hidden = false) => {
    const url = logoUrl(brand.logo);
    return (
      <Link
        key={key}
        href={`/brands/${brand.slug}`}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        title={brand.name}
        className="group mr-4 flex h-20 w-[180px] shrink-0 items-center justify-center rounded-2xl border border-line bg-paper px-6 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_16px_32px_-20px_rgba(156,22,104,0.3)] sm:h-24 sm:w-[210px]"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={brand.name}
            loading="lazy"
            className="max-h-10 w-auto max-w-full object-contain opacity-75 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-11"
          />
        ) : (
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink-soft transition-colors group-hover:text-accent-deep">
            {brand.name}
          </span>
        )}
      </Link>
    );
  };

  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep">
              <span className="h-px w-6 bg-accent-deep/60" />
              {heading?.eyebrow || t("eyebrow")}
            </span>
            <h2 className="font-display text-2xl leading-tight tracking-tight text-ink sm:text-[32px]">
              {heading?.title || t("title")}
            </h2>
          </div>
          <Link
            href="/brands"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-accent-deep link-underline"
          >
            {t("viewAll")} ({brands.length}) <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: duration }}
        >
          {shown.map((b) => tile(b, b.slug))}
          {/* Second copy so the loop is seamless (translateX -50%). */}
          {shown.map((b) => tile(b, `${b.slug}-copy`, true))}
        </div>
      </div>
    </section>
  );
}
