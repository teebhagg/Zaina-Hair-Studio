'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface PromotionCardProps {
  _id: string
  title: string
  shortText: string
  ctaText?: string
  ctaLink?: string
  bannerImage?: string
}

export function PromotionCard({
  _id,
  title,
  shortText,
  ctaText,
  ctaLink,
  bannerImage,
}: PromotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative h-64 rounded-2xl overflow-hidden"
    >
      {bannerImage && (
        <Image
          src={bannerImage}
          alt={title}
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/90 mb-4">{shortText}</p>
        <Button asChild variant="secondary">
          <Link href={ctaLink || '/book'}>{ctaText || 'Book Now'}</Link>
        </Button>
      </div>
    </motion.div>
  )
}

