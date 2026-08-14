import { CheckoutForm } from "@/components/CheckoutForm";
import { getSiteSettings } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Checkout" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const siteSettings = await getSiteSettings(locale as AppLocale);
  return <CheckoutForm siteSettings={siteSettings} />;
}
