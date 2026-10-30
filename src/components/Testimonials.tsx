import { getTranslations } from "next-intl/server";
import type { Testimonial } from "@/payload-types";
import { SectionHeading } from "@/components/SectionHeading";
import { QuoteIcon, StarIcon } from "@/components/icons";
import type { SectionText } from "@/lib/homepage";

type Props = {
  heading?: SectionText;
  testimonials: Testimonial[];
};

export async function Testimonials({ testimonials, heading }: Props) {
  const t = await getTranslations("testimonials");

  return (
    <section className="bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow={(heading?.eyebrow || t("eyebrow"))}
          title={(heading?.title || t("title"))}
          align="center"
          className="mx-auto"
        />

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col rounded-2xl bg-paper border border-line p-8 transition-all hover:shadow-[0_24px_48px_-30px_rgba(18,19,15,0.18)]"
            >
              <QuoteIcon className="h-6 w-6 text-accent-light" />
              <div className="flex items-center gap-1 text-accent mt-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="h-3.5 w-3.5" />
                ))}
              </div>
              <blockquote className="mt-4 text-[14.5px] leading-relaxed text-ink-soft flex-1">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-line-soft">
                <p className="text-[14px] font-medium text-ink">{item.clinic}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-faint">
                  {item.role} · {item.city}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
