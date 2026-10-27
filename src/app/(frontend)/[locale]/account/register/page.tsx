import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { RegisterForm } from "@/components/AccountForms";
import { getCurrentCustomer } from "@/lib/customerSession";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Become a Partner" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  if (await getCurrentCustomer()) redirect({ href: "/account", locale: locale as AppLocale });

  const t = await getTranslations({ locale: locale as AppLocale, namespace: "account" });

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("registerTitle")} description={t("registerDescription")} />
      <section className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <RegisterForm />
        </div>
      </section>
    </>
  );
}
