import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { ArrowRightIcon, BadgeCheckIcon, ShieldCheckIcon, StarIcon } from "@/components/icons";
import { VialGlyph, UploadedImage, mediaUrl } from "@/components/media";
import type { Homepage } from "@/payload-types";

type Props = {
  hero?: Homepage["hero"];
};

export function Hero({ hero }: Props) {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-mist">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 60% at 15% 0%, #fdeaf4 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, #eef0f6 0%, transparent 60%)",
        }}
      />
      <div className="absolute inset-0 bg-noise opacity-[0.35]" />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-paper/70 px-4 py-1.5 text-[12px] font-medium tracking-wide text-accent-deep backdrop-blur-sm">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              {hero?.eyebrow}
            </span>

            <h1 className="mt-6 font-display text-[2.6rem] sm:text-6xl lg:text-[3.6rem] leading-[1.05] tracking-tight text-ink text-balance">
              {hero?.title}
            </h1>

            <p className="mt-6 max-w-lg text-[16px] sm:text-lg leading-relaxed text-ink-soft">
              {hero?.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button href={hero?.primaryCtaHref || "/catalog"} size="lg">
                {hero?.primaryCtaLabel || t("primaryCta")}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
              <Button href={hero?.secondaryCtaHref || "/account/register"} variant="secondary" size="lg">
                {hero?.secondaryCtaLabel || t("secondaryCta")}
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-md border-t border-line pt-7">
              <div>
                <p className="font-display text-2xl sm:text-3xl text-ink">{hero?.statsProducts}</p>
                <p className="mt-1 text-[12.5px] text-ink-faint">{t("statsProductsLabel")}</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl text-ink">{hero?.statsBrands}</p>
                <p className="mt-1 text-[12.5px] text-ink-faint">{t("statsBrandsLabel")}</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl text-ink">{hero?.statsClinics}</p>
                <p className="mt-1 text-[12.5px] text-ink-faint">{t("statsClinicsLabel")}</p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="relative mx-auto aspect-[4/5] max-w-md rounded-[2rem] border border-line bg-paper/60 backdrop-blur-sm shadow-[0_30px_80px_-30px_rgba(156,22,104,0.28)] overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(120% 100% at 30% 10%, #fdeaf4 0%, #eef0f6 50%, #ffffff 100%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />
              {mediaUrl(hero?.image) ? (
                <UploadedImage media={hero?.image} />
              ) : (
                <VialGlyph className="absolute inset-0 h-full w-full p-14 text-ink/70 opacity-80" />
              )}

              <div className="absolute left-6 top-6 rounded-2xl bg-paper/90 backdrop-blur-sm border border-line px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="h-3.5 w-3.5" />
                  ))}
                </div>
                <p className="mt-1 text-[11.5px] text-ink-soft">{t("ratedBadge")}</p>
              </div>

              <div className="absolute bottom-6 right-6 flex items-center gap-2.5 rounded-2xl bg-ink text-paper px-4 py-3 shadow-lg">
                <BadgeCheckIcon className="h-4 w-4 text-accent-light" />
                <span className="text-[12.5px] font-medium">{t("authenticBadge")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
