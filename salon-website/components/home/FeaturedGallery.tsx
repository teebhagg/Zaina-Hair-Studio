'use client'

import { GalleryItem } from '@/components/gallery/GalleryItem'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePathname } from 'next/navigation'

interface FeaturedGalleryProps {
  gallery: any[]
}

export function FeaturedGallery({ gallery }: FeaturedGalleryProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
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
        <h2 className="text-4xl font-bold mb-4">{t('home.gallery.title')}</h2>
        <p className="text-muted-foreground text-lg">
          {t('home.gallery.subtitle')}
        </p>
      </motion.div>
      {gallery.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">
            {t('home.noFeaturedGallery')}
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
          >
            {gallery.map((item: any, index: number) => (
              <GalleryItem key={item._id} {...item} index={index} />
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button asChild variant="outline" size="lg">
              <Link href={`/${locale}/gallery`}>{t('home.gallery.viewAll')}</Link>
            </Button>
          </motion.div>
        </>
      )}
    </section>
  )
}
