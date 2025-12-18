'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface PromotionCardProps {
  _id: string
  title: string
  slug: { current: string }
  shortText: string
  ctaText?: string
  ctaLink?: string
  bannerImage?: string
  images?: string[]
}

export function PromotionCard({
  _id,
  title,
  slug,
  shortText,
  ctaText,
  ctaLink,
  bannerImage,
  images,
}: PromotionCardProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const { t } = useTranslation()
  
  // Link to promotion detail page
  const detailLink = `/${locale}/promotions/${slug.current}`
  
  // Use images array if available, otherwise fall back to bannerImage
  const displayImage = images && images.length > 0 ? images[0] : bannerImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden border border-border bg-card"
    >
      {displayImage && (
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={displayImage}
            alt={title}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground line-clamp-2">
            {shortText}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link href={detailLink} className="flex items-center justify-center gap-2">
              {t('home.promotions.showMore')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
