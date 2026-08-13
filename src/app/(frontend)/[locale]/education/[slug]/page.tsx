import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { MediaFrame, UploadedImage, mediaUrl, hueFromSlug } from "@/components/media";
import { getArticleBySlug } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale as AppLocale);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale as AppLocale);
  if (!article) notFound();

  const t = await getTranslations("education");

  return (
    <article className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <span className="rounded-full bg-mist text-[11px] font-medium tracking-wide text-ink px-3 py-1.5">
          {article.tag}
        </span>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl text-ink leading-[1.1] text-balance">
          {article.title}
        </h1>
        <p className="mt-3 text-[13px] text-ink-faint">
          {article.readTime} {t("readSuffix")}
        </p>

        <MediaFrame hue={hueFromSlug(article.slug)} className="mt-8 aspect-[16/9] rounded-2xl border border-line">
          {mediaUrl(article.coverImage) && <UploadedImage media={article.coverImage} />}
        </MediaFrame>

        <div className="mt-10 prose-fk">
          {article.content ? (
            <RichText data={article.content} />
          ) : (
            <p className="text-ink-soft leading-relaxed">{article.excerpt}</p>
          )}
        </div>
      </div>
    </article>
  );
}
