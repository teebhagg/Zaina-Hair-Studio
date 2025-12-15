'use server'

import connectDB from '@/lib/db/mongoose'
import Review from '@/lib/db/models/Review'
import Customer from '@/lib/db/models/Customer'
import { reviewSchema } from '@/lib/validators/review'

export async function submitReview(data: unknown) {
  try {
    const validated = reviewSchema.parse(data)
    await connectDB()

    let customerId
    if (validated.email) {
      const customer = await Customer.findOne({ email: validated.email })
      if (customer) {
        customerId = customer._id
      }
    }

    const review = await Review.create({
      ...validated,
      verified: true, // Auto-verify reviews so they show immediately
      customerId,
    })

    if (customerId) {
      const customer = await Customer.findById(customerId)
      if (customer) {
        customer.reviews.push(review._id)
        await customer.save()
      }
    }

    return { success: true, reviewId: review._id.toString() }
  } catch (error) {
    console.error('Error submitting review:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to submit review' }
  }
}

