import { Fragment, type ReactNode } from "react";
import { Hero } from "@/components/Hero";
import { FeaturedBrands } from "@/components/FeaturedBrands";
import { AboutUs } from "@/components/AboutUs";
import { DeviceSpotlight } from "@/components/DeviceSpotlight";
import { BestSellers } from "@/components/BestSellers";
import { ShopByCategory } from "@/components/ShopByCategory";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { NewArrivals } from "@/components/NewArrivals";
import { EducationalSection } from "@/components/EducationalSection";
import { Promotions } from "@/components/Promotions";
import { Testimonials } from "@/components/Testimonials";
import { InstagramFeed } from "@/components/InstagramFeed";
import { Newsletter } from "@/components/Newsletter";
import {
  getBrands,
  getCategories,
  getCategoryProductCounts,
  getProducts,
  getTestimonials,
  getArticles,
  getPromotions,
  getHomepage,
} from "@/lib/payload";
import { resolveSections, type SectionKey, type SectionText } from "@/lib/homepage";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const appLocale = locale as AppLocale;

  const [
    brands,
    categories,
    categoryCounts,
    products,
    testimonials,
    articles,
    promotions,
    homepage,
  ] = await Promise.all([
    getBrands(appLocale),
    getCategories(appLocale),
    getCategoryProductCounts(),
    getProducts(appLocale),
    getTestimonials(appLocale),
    getArticles(appLocale),
    getPromotions(appLocale),
    getHomepage(appLocale),
  ]);

  // Order and visibility come from Ballina → Seksionet in the admin.
  const render: Record<SectionKey, (heading: SectionText) => ReactNode> = {
    brands: (h) => <FeaturedBrands brands={brands} heading={h} />,
    about: (h) => <AboutUs about={homepage.about} heading={h} />,
    devices: (h) => <DeviceSpotlight devices={brands.filter((b) => b.type === "device")} heading={h} />,
    bestSellers: (h) => <BestSellers products={products.filter((p) => p.bestSeller)} heading={h} />,
    categories: (h) => <ShopByCategory categories={categories} counts={categoryCounts} heading={h} />,
    why: (h) => <WhyChooseUs heading={h} items={homepage.whyItems} />,
    newArrivals: (h) => <NewArrivals products={products.filter((p) => p.newArrival)} heading={h} />,
    education: (h) => <EducationalSection articles={articles} heading={h} />,
    promotions: () => <Promotions promotions={promotions} />,
    testimonials: (h) => <Testimonials testimonials={testimonials} heading={h} />,
    instagram: (h) => <InstagramFeed heading={h} />,
    newsletter: (h) => <Newsletter heading={h} />,
  };

  return (
    <>
      <Hero hero={homepage.hero} />
      {resolveSections(homepage).map(({ key, heading }) => (
        <Fragment key={key}>{render[key](heading)}</Fragment>
      ))}
    </>
  );
}
