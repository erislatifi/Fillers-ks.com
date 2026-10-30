import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Brand, Category, SiteSetting } from "@/payload-types";
import { BrandMark } from "@/components/BrandMark";
import { InstagramIcon, FacebookIcon, LinkedinIcon, ShieldCheckIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/NewsletterForm";

type Props = {
  brands: Brand[];
  categories: Category[];
  siteSettings: SiteSetting;
  // Pages from the admin marked "show in footer" (privacy, terms, …).
  footerPages: { title: string; href: string }[];
};

const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
};

export async function Footer({ brands, categories, siteSettings, footerPages }: Props) {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  // Admin-editable texts (Cilësimet → Tekstet e faqes), falling back to the built-in copy.
  const hours = siteSettings.openingHours?.trim() || t("hours");

  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-16 sm:pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_1.1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-auto" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg tracking-[0.01em] font-semibold text-paper">
                  Fillers
                </span>
                <span className="text-[10px] tracking-wide text-paper/45 -mt-0.5">
                  {siteSettings.tagline || "Ndriço me ne!"}
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed">
              {siteSettings.footerDescription || t("tagline")}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {(siteSettings.socialLinks ?? []).map((link) => {
                const Icon = link.platform ? socialIcons[link.platform] : null;
                if (!Icon || !link.url) return null;
                return (
                  <a
                    key={link.id ?? link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform ?? undefined}
                    className="h-9 w-9 rounded-full border border-paper/15 flex items-center justify-center hover:border-accent-light hover:text-accent-light transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper/90">{t("brandsHeading")}</h3>
            <ul className="mt-5 space-y-3">
              {brands.slice(0, 7).map((b) => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}`} className="text-[13.5px] hover:text-accent-light transition-colors">
                    {b.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/brands" className="text-[13.5px] text-accent-light font-medium">
                  {t("viewAllBrands")} →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper/90">{t("categoriesHeading")}</h3>
            <ul className="mt-5 space-y-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="text-[13.5px] hover:text-accent-light transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper/90">{t("companyHeading")}</h3>
            <ul className="mt-5 space-y-3">
              <li><Link href="/about" className="text-[13.5px] hover:text-accent-light transition-colors">{t("aboutUs")}</Link></li>
              <li><Link href="/education" className="text-[13.5px] hover:text-accent-light transition-colors">{t("education")}</Link></li>
              <li><Link href="/promotions" className="text-[13.5px] hover:text-accent-light transition-colors">{t("promotions")}</Link></li>
              <li><Link href="/account/register" className="text-[13.5px] hover:text-accent-light transition-colors">{t("becomePartner")}</Link></li>
              <li><Link href="/contact" className="text-[13.5px] hover:text-accent-light transition-colors">{t("contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper/90">{t("contactHeading")}</h3>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              <li>{siteSettings.address}</li>
              {siteSettings.contactPhone && (
                <li><a href={`tel:${siteSettings.contactPhone.replace(/\s/g, "")}`} className="hover:text-accent-light transition-colors">{siteSettings.contactPhone}</a></li>
              )}
              {siteSettings.contactEmail && (
                <li><a href={`mailto:${siteSettings.contactEmail}`} className="hover:text-accent-light transition-colors">{siteSettings.contactEmail}</a></li>
              )}
              <li className="whitespace-pre-line">{hours}</li>
            </ul>

            <div className="mt-6">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-paper/90">{t("newsletterHeading")}</p>
              <NewsletterForm variant="footer" />
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-accent-light/20 bg-paper/[0.04] p-6 flex items-start gap-3.5">
          <ShieldCheckIcon className="h-5 w-5 text-accent-light shrink-0 mt-0.5" />
          <p className="text-[13px] leading-relaxed text-paper/60">
            <span className="text-paper/85 font-medium">{t("noticeLabel")} </span>
            {siteSettings.professionalNotice || t("notice")}
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-paper/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-paper/45">
          <p>© {year} Fillers Kosovo. {t("rights")}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerPages.map((p) => (
              <Link key={p.href} href={p.href} className="hover:text-paper/70 transition-colors">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
