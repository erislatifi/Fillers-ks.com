import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return cmsPageMetadata({ slug: "faq", locale });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  return <CmsPage slug="faq" locale={locale} />;
}
