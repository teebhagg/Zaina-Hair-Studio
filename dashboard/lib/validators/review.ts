import { z } from 'zod'

export const reviewReplySchema = z.object({
  text: z.string().min(1, 'Reply text is required').max(500, 'Reply must be less than 500 characters'),
  author: z.string().min(1, 'Author name is required').max(100, 'Author name must be less than 100 characters'),
})

export type ReviewReplyFormData = z.infer<typeof reviewReplySchema>

export const reviewStatusSchema = z.object({
  verified: z.boolean(),
})

export type ReviewStatusFormData = z.infer<typeof reviewStatusSchema>

