'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

interface ServiceCardProps {
  _id: string
  name: string
  slug: { current: string }
  price: number
  duration: number
  description: string
  image: string
  featured?: boolean
}

export function ServiceCard({
  _id,
  name,
  slug,
  price,
  duration,
  description,
  image,
  featured,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {featured && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold">
              Featured
            </div>
          )}
        </div>
        <CardHeader>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold text-foreground">${price}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/services/${slug.current}`}>View Details</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/book?service=${slug.current}`}>Book Now</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

