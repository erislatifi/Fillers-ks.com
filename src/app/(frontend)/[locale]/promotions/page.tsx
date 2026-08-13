import { PageHero } from "@/components/PageHero";
import { Promotions } from "@/components/Promotions";
import { getPromotions } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Promotions" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PromotionsPage({ params }: Props) {
  const { locale } = await params;
  const promotions = await getPromotions(locale as AppLocale);

  return (
    <>
      <PageHero
        eyebrow="Promotions"
        title="Current offers for partner clinics"
        description="Seasonal bundles, welcome discounts and partnership offers for licensed clinics."
      />
      <Promotions promotions={promotions} />
    </>
  );
}
