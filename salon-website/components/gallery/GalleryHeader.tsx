'use client'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export function GalleryHeader() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-5xl font-bold mb-4">{t('gallery.title')}</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {t('gallery.subtitle')}
      </p>
    </motion.div>
  )
}
