'use client'

import { GalleryItem } from './GalleryItem'
import { motion } from 'framer-motion'

interface GalleryGridProps {
  gallery: any[]
}

export function GalleryGrid({ gallery }: GalleryGridProps) {
  // Staggered container animation
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

  if (gallery.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No gallery items yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
    >
      {gallery.map((item: any, index: number) => (
        <GalleryItem key={item._id} {...item} index={index} />
      ))}
    </motion.div>
  )
}
