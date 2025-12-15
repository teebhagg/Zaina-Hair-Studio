'use client'

import { ServiceCard } from '@/components/services/ServiceCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePathname } from 'next/navigation'

interface FeaturedServicesProps {
  services: any[]
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  
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
        <h2 className="text-4xl font-bold mb-4">{t('home.services.title')}</h2>
        <p className="text-muted-foreground text-lg">
          {t('home.services.subtitle')}
        </p>
      </motion.div>
      {services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">
            {t('home.noFeaturedServices')}
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service: any, index: number) => (
              <motion.div
                key={service._id}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ServiceCard {...service} />
              </motion.div>
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
              <Link href={`/${locale}/services`}>{t('home.services.viewAll')}</Link>
            </Button>
          </motion.div>
        </>
      )}
    </section>
  )
}
