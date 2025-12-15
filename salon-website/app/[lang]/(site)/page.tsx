import { AnnouncementBanner } from "@/components/home/AnnouncementBanner";
import { FeaturedGallery } from "@/components/home/FeaturedGallery";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { HeroSection } from "@/components/home/HeroSection";
import { PromotionsSection } from "@/components/home/PromotionsSection";
import { locales, type Locale } from "@/lib/i18n";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import {
    announcementsQuery,
    featuredGalleryQuery,
    featuredServicesQuery,
    homepageQuery,
    promotionsQuery
} from "@/lib/sanity/queries";
import { translateCMSArray, translateCMSNested } from "@/lib/utils/cms-locale";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  if (!lang || !hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const localeTyped = lang as Locale;

  // Only fetch from Sanity if project ID is configured
  const hasSanityConfig = isSanityConfigured();

  const [homepage, services, gallery, promotions, announcements] = await Promise.all([
    hasSanityConfig
      ? client.fetch(homepageQuery(localeTyped)).catch(() => null)
      : Promise.resolve(null),
    hasSanityConfig
      ? client.fetch(featuredServicesQuery(localeTyped)).catch(() => [])
      : Promise.resolve([]),
    hasSanityConfig
      ? client.fetch(featuredGalleryQuery(localeTyped)).catch(() => [])
      : Promise.resolve([]),
    hasSanityConfig
      ? client.fetch(promotionsQuery(localeTyped)).catch(() => [])
      : Promise.resolve([]),
    hasSanityConfig
      ? client.fetch(announcementsQuery(localeTyped)).catch(() => [])
      : Promise.resolve([]),
  ]);

  // Translate CMS content based on locale
  const translatedHomepage = homepage
    ? translateCMSNested(homepage, localeTyped, { logMissing: process.env.NODE_ENV === 'development' })
    : null;
  
  const translatedServices = translateCMSArray(services, localeTyped, { logMissing: process.env.NODE_ENV === 'development' });
  const translatedGallery = translateCMSArray(gallery, localeTyped, { logMissing: process.env.NODE_ENV === 'development' });
  const translatedPromotions = translateCMSArray(promotions, localeTyped, { logMissing: process.env.NODE_ENV === 'development' });
  const translatedAnnouncements = translateCMSArray(announcements, localeTyped, { logMissing: process.env.NODE_ENV === 'development' });


  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <HeroSection
        heroTitle={translatedHomepage?.heroTitle || dict.home.hero.title}
        heroSubtitle={
          translatedHomepage?.heroSubtitle || dict.home.hero.subtitle
        }
        heroCtaText={translatedHomepage?.heroCtaText}
        heroCtaLink={translatedHomepage?.heroCtaLink}
        heroImage={translatedHomepage?.heroImage}
      />

      {/* Announcements */}
      <AnnouncementBanner announcements={translatedAnnouncements} />

      {/* Promotions */}
      <PromotionsSection promotions={translatedPromotions} />

      {/* Featured Services - Only Featured Items */}
      <FeaturedServices services={translatedServices} />

      {/* Featured Gallery - Only Featured Items */}
      <FeaturedGallery gallery={translatedGallery} />
    </div>
  );
}
