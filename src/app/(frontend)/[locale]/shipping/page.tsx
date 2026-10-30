import { CmsPage, cmsPageMetadata } from "@/components/CmsPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return cmsPageMetadata({ slug: "shipping", locale });
}

export default async function ShippingPage({ params }: Props) {
  const { locale } = await params;
  return <CmsPage slug="shipping" locale={locale} />;
}
