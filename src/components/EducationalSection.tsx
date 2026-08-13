import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/payload-types";
import { SectionHeading } from "@/components/SectionHeading";
import { MediaFrame, UploadedImage, mediaUrl, hueFromSlug } from "@/components/media";
import { ArrowRightIcon } from "@/components/icons";

type Props = {
  articles: Article[];
};

export async function EducationalSection({ articles }: Props) {
  const t = await getTranslations("education");

  return (
    <section className="bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
          <Link
            href="/education"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-accent-deep link-underline shrink-0"
          >
            {t("visit")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
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
  );
}
