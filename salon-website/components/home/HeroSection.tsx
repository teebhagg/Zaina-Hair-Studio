'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface HeroSectionProps {
  heroTitle?: string
  heroSubtitle?: string
  heroCtaText?: string
  heroCtaLink?: string
  heroImage?: string
}

export function HeroSection({
  heroTitle,
  heroSubtitle,
  heroCtaText,
  heroCtaLink,
  heroImage,
}: HeroSectionProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  
  // Ensure CTA link includes locale
  const ctaLink = heroCtaLink 
    ? heroCtaLink.startsWith('/') 
      ? `/${locale}${heroCtaLink}` 
      : heroCtaLink
    : `/${locale}/book`

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {heroImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Hero"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
      )}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            {heroTitle || "Welcome to Zainab's Salon"}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {heroSubtitle || 'Experience luxury beauty services'}
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href={ctaLink}>
              {heroCtaText || 'Book Appointment'}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
