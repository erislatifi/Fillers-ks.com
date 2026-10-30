"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Brand, Category, SiteSetting } from "@/payload-types";
import { BrandMark } from "@/components/BrandMark";
import { BrandBadge } from "@/components/media";
import { useCart } from "@/contexts/CartContext";
import {
  SearchIcon,
  HeartIcon,
  UserIcon,
  BagIcon,
  ChevronDownIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";

type Props = {
  brands: Brand[];
  categories: Category[];
  // Only the bits the header shows — keeps the client payload small.
  contact: Pick<SiteSetting, "contactPhone" | "contactEmail" | "tagline" | "topBarNotice" | "englishEnabled"> & {
    logoUrl: string | null;
  };
};

export function Header({ brands, categories, contact }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();

  const navItems = [
    { label: t("shop"), href: "/catalog" },
    { label: t("brands"), key: "brands" },
    { label: t("categories"), key: "categories" },
    { label: t("newArrivals"), href: "/new-arrivals" },
    { label: t("promotions"), href: "/promotions" },
    { label: t("education"), href: "/education" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ] as const;

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden md:block bg-ink text-paper/85">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 flex items-center justify-between h-9 text-[12px] tracking-wide">
          <p>{contact.topBarNotice || t("utilityNotice")}</p>
          <div className="flex items-center gap-6">
            {contact.contactPhone && (
              <a href={`tel:${contact.contactPhone.replace(/\s/g, "")}`} className="hover:text-accent-light transition-colors">
                {contact.contactPhone}
              </a>
            )}
            {contact.contactEmail && (
              <a href={`mailto:${contact.contactEmail}`} className="hover:text-accent-light transition-colors">
                {contact.contactEmail}
              </a>
            )}
            {contact.englishEnabled !== false && (
            <div className="flex items-center gap-1.5 border-l border-paper/20 pl-6">
              <button
                onClick={() => switchLocale("sq")}
                className={`px-1.5 transition-colors ${locale === "sq" ? "text-accent-light font-semibold" : "hover:text-accent-light"}`}
              >
                SQ
              </button>
              <span className="text-paper/30">/</span>
              <button
                onClick={() => switchLocale("en")}
                className={`px-1.5 transition-colors ${locale === "en" ? "text-accent-light font-semibold" : "hover:text-accent-light"}`}
              >
                EN
              </button>
            </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`bg-paper/90 backdrop-blur-md border-b transition-shadow ${
          scrolled ? "shadow-[0_1px_0_rgba(18,19,15,0.06)] border-line" : "border-transparent"
        }`}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              {contact.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={contact.logoUrl} alt="Fillers Kosovo" className="h-11 w-auto max-w-[200px] object-contain" />
              ) : (
                <>
                  <BrandMark className="h-9 w-auto" />
                  <span className="flex flex-col leading-none">
                    <span className="font-display text-[22px] tracking-[0.01em] font-semibold brand-gradient-text">
                      Fillers
                    </span>
                    <span className="text-[10.5px] tracking-wide text-ink-faint -mt-0.5">
                      {contact.tagline || "Ndriço me ne!"}
                    </span>
                  </span>
                </>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  onMouseEnter={() => "key" in item && setOpenMenu(item.key)}
                  className="relative"
                >
                  {"href" in item ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 px-4 py-2 text-[13.5px] font-medium text-ink/80 hover:text-ink transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className="flex items-center gap-1 px-4 py-2 text-[13.5px] font-medium text-ink/80 hover:text-ink transition-colors"
                      aria-expanded={openMenu === item.key}
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={`h-3.5 w-3.5 transition-transform ${openMenu === item.key ? "rotate-180 text-accent-deep" : ""}`}
                      />
                    </button>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                aria-label={t("searchPlaceholder")}
                onClick={() => setSearchOpen((v) => !v)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-mist transition-colors"
              >
                <SearchIcon className="h-[19px] w-[19px] text-ink/80" />
              </button>
              <Link
                href="/wishlist"
                aria-label={t("wishlist")}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist transition-colors"
              >
                <HeartIcon className="h-[19px] w-[19px] text-ink/80" />
              </Link>
              <Link
                href="/account"
                aria-label={t("account")}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist transition-colors"
              >
                <UserIcon className="h-[19px] w-[19px] text-ink/80" />
              </Link>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-mist transition-colors"
              >
                <BagIcon className="h-[19px] w-[19px] text-ink/80" />
                {count > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-[16px] w-[16px] rounded-full bg-accent text-paper text-[9.5px] font-semibold flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
              <button
                aria-label={t("menu")}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-mist transition-colors"
              >
                <MenuIcon className="h-5 w-5 text-ink/80" />
              </button>
            </div>
          </div>
        </div>

        {/* search overlay row */}
        {searchOpen && (
          <div className="border-t border-line bg-paper">
            <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-4">
              <div className="flex items-center gap-3 rounded-full border border-line px-5 py-3 focus-within:border-accent transition-colors">
                <SearchIcon className="h-4 w-4 text-ink-faint shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
                />
                <button onClick={() => setSearchOpen(false)} aria-label="Close search">
                  <CloseIcon className="h-4 w-4 text-ink-faint" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* mega menu: brands */}
        {openMenu === "brands" && (
          <div className="hidden lg:block border-t border-line bg-paper animate-fade-up">
            <div className="mx-auto max-w-[1400px] px-10 py-10 grid grid-cols-4 gap-x-8 gap-y-5">
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="group flex items-start gap-3 rounded-xl p-2.5 -m-2.5 hover:bg-mist transition-colors"
                >
                  <BrandBadge
                    name={b.name}
                    logo={b.logo}
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist-2 text-[11px] font-display font-semibold text-accent-deep group-hover:bg-accent-pale overflow-hidden"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">{b.name}</span>
                    <span className="block text-xs text-ink-faint mt-0.5">
                      {typeof b.category === "object" && b.category ? b.category.name : ""}
                    </span>
                  </span>
                </Link>
              ))}
              <Link
                href="/brands"
                className="col-span-4 mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent-deep link-underline w-fit"
              >
                {t("viewAllBrands")} →
              </Link>
            </div>
          </div>
        )}

        {/* mega menu: categories */}
        {openMenu === "categories" && (
          <div className="hidden lg:block border-t border-line bg-paper animate-fade-up">
            <div className="mx-auto max-w-[1400px] px-10 py-10 grid grid-cols-4 gap-x-8 gap-y-5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group rounded-xl p-2.5 -m-2.5 hover:bg-mist transition-colors"
                >
                  <span className="block text-sm font-medium text-ink">{c.name}</span>
                  <span className="block text-xs text-ink-faint mt-0.5">{c.description}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-paper shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display text-lg font-semibold">{t("menu")}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            {contact.englishEnabled !== false && (
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => switchLocale("sq")}
                className={`px-3 py-1.5 rounded-full text-sm border ${locale === "sq" ? "border-accent text-accent-deep font-semibold" : "border-line text-ink-soft"}`}
              >
                Shqip
              </button>
              <button
                onClick={() => switchLocale("en")}
                className={`px-3 py-1.5 rounded-full text-sm border ${locale === "en" ? "border-accent text-accent-deep font-semibold" : "border-line text-ink-soft"}`}
              >
                English
              </button>
            </div>
            )}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={"href" in item ? item.href : `/${item.key}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-[15px] font-medium border-b border-line-soft text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/account" onClick={() => setMobileOpen(false)} className="py-3 text-[15px] font-medium border-b border-line-soft text-ink">
                {t("account")}
              </Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="py-3 text-[15px] font-medium text-ink">
                {t("wishlist")}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
