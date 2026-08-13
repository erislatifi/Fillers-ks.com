import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/components/icons";
import type { Promotion } from "@/payload-types";

type Props = {
  promotions: Promotion[];
};

export function Promotions({ promotions }: Props) {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-6">
          {promotions.map((promo) => {
            const isDark = promo.theme === "dark";
            return (
              <Link
                key={promo.slug}
                href={promo.ctaHref || `/promotions/${promo.slug}`}
                className={`group relative overflow-hidden rounded-3xl p-10 sm:p-12 min-h-[320px] flex flex-col justify-end ${
                  isDark ? "bg-ink" : ""
                }`}
                style={
                  isDark
                    ? undefined
                    : {
                        backgroundImage:
                          "radial-gradient(120% 100% at 15% 0%, #fdeaf4 0%, #f3e8f0 55%, #f7f6f6 100%)",
                      }
                }
              >
                <div
                  className={isDark ? "absolute inset-0 opacity-60" : "absolute inset-0 bg-noise opacity-30"}
                  style={
                    isDark
                      ? {
                          backgroundImage:
                            "radial-gradient(120% 100% at 85% 0%, rgba(233,30,140,0.32) 0%, transparent 60%)",
                        }
                      : undefined
                  }
                />
                <span
                  className={`relative inline-flex w-fit rounded-full text-[11px] font-semibold tracking-wide px-3 py-1.5 mb-5 ${
                    isDark ? "bg-accent text-paper" : "bg-ink text-paper"
                  }`}
                >
                  {promo.badge}
                </span>
                <h3
                  className={`relative font-display text-2xl sm:text-3xl max-w-sm text-balance ${
                    isDark ? "text-paper" : "text-ink"
                  }`}
                >
                  {promo.title}
                </h3>
                <p
                  className={`relative mt-3 max-w-sm text-[14px] ${
                    isDark ? "text-paper/65" : "text-ink-soft"
                  }`}
                >
                  {promo.description}
                </p>
                <span
                  className={`relative mt-6 inline-flex items-center gap-2 text-sm font-medium ${
                    isDark ? "text-paper" : "text-ink"
                  }`}
                >
                  {promo.ctaLabel}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
