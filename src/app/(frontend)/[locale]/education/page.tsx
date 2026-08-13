import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { MediaFrame, UploadedImage, mediaUrl, hueFromSlug } from "@/components/media";
import { getArticles } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Educational Center" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EducationPage({ params }: Props) {
  const { locale } = await params;
  const appLocale = locale as AppLocale;
  const articles = await getArticles(appLocale);
  const t = await getTranslations("education");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link key={a.slug} href={`/education/${a.slug}`} className="group block">
                <MediaFrame hue={hueFromSlug(a.slug)} className="aspect-[16/10] rounded-2xl border border-line">
                  {mediaUrl(a.coverImage) && <UploadedImage media={a.coverImage} />}
                  <span className="absolute top-4 left-4 rounded-full bg-paper/90 backdrop-blur-sm text-[11px] font-medium tracking-wide text-ink px-3 py-1.5">
                    {a.tag}
                  </span>
                </MediaFrame>
                <div className="mt-5">
                  <h3 className="font-display text-[17px] leading-snug text-ink group-hover:text-accent-deep transition-colors">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft line-clamp-2">
                    {a.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-faint">
                    <span>{a.readTime} {t("readSuffix")}</span>
                    <span>·</span>
                    <span className="text-accent-deep font-medium">{t("readArticle")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
