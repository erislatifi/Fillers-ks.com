import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/SectionHeading";
import { BrandMark } from "@/components/BrandMark";
import type { Homepage } from "@/payload-types";

type Props = {
  about?: Homepage["about"];
};

export async function AboutUs({ about }: Props) {
  const t = await getTranslations("about");

  const stats = [
    { value: "100+", label: t("statsProductsLabel") },
    { value: "14", label: t("statsBrandsLabel") },
    { value: "2", label: t("statsCountriesLabel") },
    { value: "500+", label: t("statsClinicsLabel") },
  ];

  return (
    <section className="bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeading eyebrow={t("eyebrow")} title={about?.title || ""} />
            <p className="mt-6 text-[15px] sm:text-base leading-relaxed text-ink-soft">
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

          <div className="relative rounded-[2rem] border border-line bg-paper p-10 sm:p-14 flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />
            <BrandMark className="relative h-16 w-auto" />
            <p className="relative mt-6 font-display text-xl text-ink text-balance max-w-xs">
              {about?.quote}
            </p>
            <p className="relative mt-4 text-[13px] text-ink-faint">
              {about?.distributionNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
