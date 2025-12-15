import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Review from '@/lib/db/models/Review'

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ reviews: [] })
    }
    await connectDB()
    // Show all reviews (both verified and unverified)
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    // Format reviews for client
    const formattedReviews = reviews.map((review: any) => ({
      _id: review._id.toString(),
      rating: review.rating,
      text: review.text,
      author: review.author,
      createdAt: review.createdAt instanceof Date 
        ? review.createdAt.toISOString() 
        : review.createdAt,
      replies: review.replies || [],
    }))

    return NextResponse.json({ reviews: formattedReviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ reviews: [] })
  }
}

