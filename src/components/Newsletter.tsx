import { getTranslations } from "next-intl/server";
import { NewsletterForm } from "@/components/NewsletterForm";
import type { SectionText } from "@/lib/homepage";

export async function Newsletter({ heading }: { heading?: SectionText } = {}) {
  const t = await getTranslations("newsletter");

  return (
    <section className="bg-mist py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="rounded-3xl border border-line bg-paper px-8 py-14 sm:px-16 sm:py-16 text-center relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 80% at 50% 0%, #fdeaf4 0%, transparent 60%)",
            }}
          />
          <div className="relative max-w-xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep">
              {(heading?.eyebrow || t("eyebrow"))}
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl tracking-tight text-ink text-balance">
              {(heading?.title || t("title"))}
            </h2>
            <p className="mt-3 text-[14px] text-ink-soft">
              {(heading?.description || t("description"))}
            </p>

            <NewsletterForm variant="section" />
          </div>
        </div>
      </div>
    </section>
  );
}
