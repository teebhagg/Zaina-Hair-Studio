'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
interface GalleryItemProps {
  _id: string
  image: string
  caption?: string
  category?: string
  index?: number
}

export function GalleryItem({ _id, image, caption, category, index = 0 }: GalleryItemProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.7,
        delay: (index || 0) * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="group relative overflow-visible cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 mb-4 break-inside-avoid"
    >
      <div className="relative w-full overflow-hidden">
        <Image
          src={image}
          alt={caption || 'Gallery image'}
          width={400}
          height={600}
          className="object-cover w-full h-auto transition-opacity duration-300 group-hover:opacity-95"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        {/* Animated stroke border */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            <motion.rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="0"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              initial={{ pathLength: 0, opacity: 0 }}
              whileHover={{ 
                pathLength: 1, 
                opacity: 1,
              }}
              transition={{ 
                pathLength: { duration: 0.6, ease: "easeInOut" },
                opacity: { duration: 0.2 }
              }}
            />
          </svg>
        </motion.div>
      </div>
      {(caption || category) && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"
        >
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            {category && (
              <motion.span 
                initial={{ y: 10, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs uppercase tracking-wider text-primary mb-2 block font-semibold"
              >
                {category}
              </motion.span>
            )}
            {caption && (
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-sm font-medium leading-relaxed"
              >
                {caption}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
