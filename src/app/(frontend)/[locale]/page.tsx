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
import { resolveSections, SECTION_KEYS, type SectionKey, type SectionText } from "@/lib/homepage";
import { RenderBlock } from "@/components/blocks/RenderBlocks";
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

  // Ballina → Blloqet: built-in sections and free blocks in the admin's order. Until that
  // list is saved for the first time, the older section list (or the defaults) is used.
  const layout = homepage.layout ?? [];
  return (
    <>
      <Hero hero={homepage.hero} />
      {layout.length > 0
        ? layout.map((block, i) => {
            const key = block.id ?? String(i);
            if (block.blockType === "section") {
              if (block.isHidden || !SECTION_KEYS.includes(block.section as SectionKey)) return null;
              const heading = { eyebrow: block.eyebrow, title: block.title, description: block.description };
              return <Fragment key={key}>{render[block.section as SectionKey](heading)}</Fragment>;
            }
            return <RenderBlock key={key} block={block} locale={appLocale} />;
          })
        : resolveSections(homepage).map(({ key, heading }) => <Fragment key={key}>{render[key](heading)}</Fragment>)}
    </>
  );
}
