import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  return cmsPageMetadata({ slug, locale });
}

// Pages the client adds in the admin with any slug other than privacy/terms/shipping/faq.
export default async function InfoPage({ params }: Props) {
  const { locale, slug } = await params;
  return <CmsPage slug={slug} locale={locale} />;
}
