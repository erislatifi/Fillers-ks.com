import { CheckoutForm } from "@/components/CheckoutForm";
import { getSiteSettings } from "@/lib/payload";
import { getCurrentCustomer, toProfile } from "@/lib/customerSession";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Checkout" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const [siteSettings, customer] = await Promise.all([
    getSiteSettings(locale as AppLocale),
    getCurrentCustomer(),
  ]);
  return <CheckoutForm siteSettings={siteSettings} customer={customer && toProfile(customer)} />;
}
