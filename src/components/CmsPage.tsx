import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHero } from "@/components/PageHero";
import { ChevronDownIcon } from "@/components/icons";
import { getPageBySlug } from "@/lib/pages";
import type { AppLocale } from "@/i18n/routing";

type Props = { slug: string; locale: string };

export async function cmsPageMetadata({ slug, locale }: Props): Promise<Metadata> {
  const page = await getPageBySlug(slug, locale as AppLocale);
  if (!page) return {};
  return { title: page.title, description: page.metaDescription ?? page.intro ?? undefined };
}

/** A text page edited in the admin (Përmbajtja → Faqet). 404 when the slug doesn't exist. */
export async function CmsPage({ slug, locale }: Props) {
  const page = await getPageBySlug(slug, locale as AppLocale);
  if (!page) notFound();
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "pages" });

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={page.title} description={page.intro ?? undefined} />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          {page.content && (
            <div className="prose-fk">
              <RichText data={page.content} />
            </div>
          )}

          {page.faq && page.faq.length > 0 && (
            <div className={page.content ? "mt-12" : undefined}>
              <div className="divide-y divide-line rounded-2xl border border-line">
                {page.faq.map((item) => (
                  <details key={item.id} className="group px-5 py-4 open:bg-mist/60">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                      {item.question}
                      <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-soft">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <p className="mt-12 text-[12.5px] text-ink-faint">
            {t("updated", {
              date: new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", { dateStyle: "long" }).format(
                new Date(page.updatedAt),
              ),
            })}
          </p>
        </div>
      </section>
    </>
  );
}
