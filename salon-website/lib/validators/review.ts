import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(10, 'Review must be at least 10 characters'),
  author: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

export type ReviewFormData = z.infer<typeof reviewSchema>

