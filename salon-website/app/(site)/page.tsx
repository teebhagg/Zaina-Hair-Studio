import { client, isSanityConfigured } from '@/lib/sanity/client'
import {
  homepageQuery,
  featuredServicesQuery,
  featuredGalleryQuery,
  promotionsQuery,
} from '@/lib/sanity/queries'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { HeroSection } from '@/components/home/HeroSection'
import { PromotionCard } from '@/components/home/PromotionCard'
import { FeaturedServices } from '@/components/home/FeaturedServices'
import { FeaturedGallery } from '@/components/home/FeaturedGallery'

export default async function HomePage() {
  // Only fetch from Sanity if project ID is configured
  const hasSanityConfig = isSanityConfigured()
  
  const [homepage, services, gallery, promotions] = await Promise.all([
    hasSanityConfig ? client.fetch(homepageQuery).catch(() => null) : Promise.resolve(null),
    hasSanityConfig ? client.fetch(featuredServicesQuery).catch(() => []) : Promise.resolve([]),
    hasSanityConfig ? client.fetch(featuredGalleryQuery).catch(() => []) : Promise.resolve([]),
    hasSanityConfig ? client.fetch(promotionsQuery).catch(() => []) : Promise.resolve([]),
  ])

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <HeroSection
        heroTitle={homepage?.heroTitle}
        heroSubtitle={homepage?.heroSubtitle}
        heroCtaText={homepage?.heroCtaText}
        heroCtaLink={homepage?.heroCtaLink}
        heroImage={homepage?.heroImage}
      />

      {/* Promotions */}
      {promotions.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo: any) => (
              <PromotionCard
                key={promo._id}
                _id={promo._id}
                title={promo.title}
                shortText={promo.shortText}
                ctaText={promo.ctaText}
                ctaLink={promo.ctaLink}
                bannerImage={promo.bannerImage}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Services - Only Featured Items */}
      <FeaturedServices services={services} />

      {/* Featured Gallery - Only Featured Items */}
      <FeaturedGallery gallery={gallery} />
    </div>
  )
}
