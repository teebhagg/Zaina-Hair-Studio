import { z } from 'zod'

export const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  bannerImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  shortText: z.string().min(1, 'Short text is required').max(500, 'Short text must be less than 500 characters'),
  ctaText: z.string().min(1, 'CTA text is required').max(50, 'CTA text must be less than 50 characters'),
  ctaLink: z.string().min(1, 'CTA link is required').max(200, 'CTA link must be less than 200 characters'),
  active: z.boolean().default(true),
  startDate: z.string().optional().or(z.date().optional()),
  endDate: z.string().optional().or(z.date().optional()),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end >= start
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export type PromotionFormData = z.infer<typeof promotionSchema>

