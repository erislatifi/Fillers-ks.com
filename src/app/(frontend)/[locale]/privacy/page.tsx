import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return cmsPageMetadata({ slug: "privacy", locale });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  return <CmsPage slug="privacy" locale={locale} />;
}
