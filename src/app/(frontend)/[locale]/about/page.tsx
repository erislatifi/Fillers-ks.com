import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { BrandMark } from "@/components/BrandMark";
import { getHomepage } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "About Us" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const appLocale = locale as AppLocale;
  const homepage = await getHomepage(appLocale);
  const about = homepage.about;
  const t = await getTranslations("about");

  const stats = [
    { value: "100+", label: t("statsProductsLabel") },
    { value: "14", label: t("statsBrandsLabel") },
    { value: "2", label: t("statsCountriesLabel") },
    { value: "500+", label: t("statsClinicsLabel") },
  ];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={about?.title || ""} />

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <p className="text-[15px] sm:text-base leading-relaxed text-ink-soft">
                {about?.paragraph1}
              </p>
              <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-ink-soft">
                {about?.paragraph2}
              </p>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-lg">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl text-ink">{s.value}</p>
                    <p className="mt-1 text-[12px] text-ink-faint leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[2rem] border border-line bg-mist p-10 sm:p-14 flex flex-col items-center justify-center text-center overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />
              <BrandMark className="relative h-16 w-auto" />
              <p className="relative mt-6 font-display text-xl text-ink text-balance max-w-xs">
                {about?.quote}
              </p>
              <p className="relative mt-4 text-[13px] text-ink-faint">{about?.distributionNote}</p>
            </div>
          </div>
        </div>
      </section>

      <WhyChooseUs />
    </>
  );
}
