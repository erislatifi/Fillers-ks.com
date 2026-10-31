import { getTranslations } from "next-intl/server";
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
  const [promotions, t] = await Promise.all([
    getPromotions(locale as AppLocale),
    getTranslations({ locale: locale as AppLocale, namespace: "promotionsPage" }),
  ]);

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <Promotions promotions={promotions} />
    </>
  );
}
