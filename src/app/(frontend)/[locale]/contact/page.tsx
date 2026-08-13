import { PageHero } from "@/components/PageHero";
import { getSiteSettings } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";

export const metadata = { title: "Contact" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const siteSettings = await getSiteSettings(locale as AppLocale);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to our team"
        description="Have a question about a product, an order, or becoming a partner clinic? Reach out — we usually reply within one business day."
      />

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-[0.8fr_1.2fr] gap-14">
          <div>
            <h2 className="font-display text-xl text-ink mb-6">Contact details</h2>
            <ul className="space-y-4 text-[14px] text-ink-soft">
              {siteSettings.address && <li>{siteSettings.address}</li>}
              {siteSettings.contactPhone && (
                <li>
                  <a href={`tel:${siteSettings.contactPhone.replace(/\s/g, "")}`} className="hover:text-accent-deep transition-colors">
                    {siteSettings.contactPhone}
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
            </ul>

            <div className="mt-8 rounded-2xl border border-line bg-mist p-5 text-[13px] leading-relaxed text-ink-soft">
              For licensed medical professionals and certified aesthetic clinics only. New
              clinics will be asked to verify their professional license before their first order.
            </div>
          </div>

          <form className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-1">
              <label className="text-[13px] font-medium text-ink">Full name</label>
              <input
                type="text"
                required
                className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-[13px] font-medium text-ink">Clinic name</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-[13px] font-medium text-ink">Email</label>
              <input
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-[13px] font-medium text-ink">Phone</label>
              <input
                type="tel"
                className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[13px] font-medium text-ink">Message</label>
              <textarea
                rows={5}
                required
                className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-ink text-paper px-7 py-3.5 text-sm font-medium hover:bg-accent-deep transition-colors"
              >
                Send message
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
