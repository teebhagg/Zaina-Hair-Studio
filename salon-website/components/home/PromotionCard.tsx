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
}

export function PromotionCard({
  _id,
  title,
  slug,
  shortText,
  ctaText,
  ctaLink,
  bannerImage,
}: PromotionCardProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const { t } = useTranslation()
  
  // Link to promotion detail page
  const detailLink = `/${locale}/promotions/${slug.current}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative h-80 overflow-hidden rounded-sm border border-border bg-card"
    >
      {bannerImage && (
        <div className="absolute inset-0">
          <Image
            src={bannerImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground mb-6 line-clamp-2">
            {shortText}
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="outline" className="flex-1">
              <Link href={detailLink} className="flex items-center justify-center gap-2">
                {t('home.promotions.showMore')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
