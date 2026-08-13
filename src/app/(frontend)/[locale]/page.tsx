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

  return (
    <>
      <Hero hero={homepage.hero} />
      <FeaturedBrands brands={brands} />
      <AboutUs about={homepage.about} />
      <DeviceSpotlight devices={brands.filter((b) => b.type === "device")} />
      <BestSellers products={products.filter((p) => p.bestSeller)} />
      <ShopByCategory categories={categories} counts={categoryCounts} />
      <WhyChooseUs />
      <NewArrivals products={products.filter((p) => p.newArrival)} />
      <EducationalSection articles={articles} />
      <Promotions promotions={promotions} />
      <Testimonials testimonials={testimonials} />
      <InstagramFeed />
      <Newsletter />
    </>
  );
}
