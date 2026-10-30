import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "contact" });
  return { title: t("eyebrow") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const [siteSettings, t] = await Promise.all([
    getSiteSettings(locale as AppLocale),
    getTranslations({ locale: locale as AppLocale, namespace: "contact" }),
  ]);
  const whatsappDigits = siteSettings.whatsapp?.replace(/\D/g, "");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-[0.8fr_1.2fr] gap-14">
          <div>
            <h2 className="font-display text-xl text-ink mb-6">{t("detailsTitle")}</h2>
            <ul className="space-y-4 text-[14px] text-ink-soft">
              {siteSettings.address && <li>{siteSettings.address}</li>}
              {siteSettings.contactPhone && (
                <li>
                  <a href={`tel:${siteSettings.contactPhone.replace(/\s/g, "")}`} className="hover:text-accent-deep transition-colors">
                    {siteSettings.contactPhone}
                  </a>
                </li>
              )}
              {whatsappDigits && (
                <li>
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-ink hover:border-accent hover:text-accent-deep transition-colors"
                  >
                    {t("whatsapp")}
                  </a>
                </li>
              )}
              {siteSettings.contactEmail && (
                <li>
                  <a href={`mailto:${siteSettings.contactEmail}`} className="hover:text-accent-deep transition-colors">
                    {siteSettings.contactEmail}
                  </a>
                </li>
              )}
              {siteSettings.openingHours && (
                <li>
                  <p className="font-medium text-ink">{t("hours")}</p>
                  <p className="mt-1 whitespace-pre-line">{siteSettings.openingHours}</p>
                </li>
              )}
            </ul>

            <div className="mt-8 rounded-2xl border border-line bg-mist p-5 text-[13px] leading-relaxed text-ink-soft">
              {t("professionalNotice")}
            </div>
          </div>

          <ContactForm />
        </div>

        {siteSettings.showMap !== false && siteSettings.address && (
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-16">
            <iframe
              title={t("mapTitle")}
              src={`https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address)}&output=embed`}
              className="h-[360px] w-full rounded-2xl border border-line"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </section>
    </>
  );
}
