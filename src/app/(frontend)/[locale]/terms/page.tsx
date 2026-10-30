import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return cmsPageMetadata({ slug: "terms", locale });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  return <CmsPage slug="terms" locale={locale} />;
}
