import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z.number({
    required_error: 'Please select a rating',
    invalid_type_error: 'Rating must be a number',
  }).min(1, 'Please select at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  text: z.string({
    required_error: 'Please write a review comment',
  }).min(10, 'Your review comment must be at least 10 characters long').max(1000, 'Your review comment is too long (maximum 1000 characters)'),
  author: z.string({
    required_error: 'Please enter your name',
  }).min(2, 'Your name must be at least 2 characters long').max(100, 'Your name is too long'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
})

export type ReviewFormData = z.infer<typeof reviewSchema>

