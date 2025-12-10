'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface ReviewCardProps {
  _id: string
  rating: number
  text: string
  author: string
  createdAt: string
  replies?: Array<{
    text: string
    author: string
    createdAt: string
  }>
}

export function ReviewCard({
  rating,
  text,
  author,
  createdAt,
  replies = [],
}: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{author}</h4>
              <p className="text-xs text-muted-foreground">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating
                      ? 'fill-primary text-primary'
                      : 'fill-none text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/90">{text}</p>
          {replies.length > 0 && (
            <div className="mt-4 space-y-2 pl-4 border-l-2 border-primary/30">
              {replies.map((reply, idx) => (
                <div key={idx} className="text-sm">
                  <p className="font-semibold text-primary">{reply.author}</p>
                  <p className="text-muted-foreground">{reply.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

