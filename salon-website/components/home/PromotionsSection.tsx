'use client'

import { PromotionCard } from '@/components/home/PromotionCard'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface PromotionsSectionProps {
  promotions: any[]
}

export function PromotionsSection({ promotions }: PromotionsSectionProps) {
  const { t } = useTranslation()
  
  if (promotions.length === 0) {
    return null
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <section className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4">{t('home.promotions.title')}</h2>
        <p className="text-muted-foreground text-lg">
          {t('home.promotions.subtitle')}
        </p>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {promotions.map((promo: any, index: number) => (
          <motion.div
            key={promo._id}
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <PromotionCard
              _id={promo._id}
              title={promo.title}
              slug={promo.slug}
              shortText={promo.shortText}
              ctaText={promo.ctaText}
              ctaLink={promo.ctaLink}
              bannerImage={promo.bannerImage}
              images={promo.images}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
