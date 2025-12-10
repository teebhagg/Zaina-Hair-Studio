import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongoose'
import Review from '@/lib/db/models/Review'

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ reviews: [] })
    }
    await connectDB()
    const reviews = await Review.find({ verified: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ reviews: [] })
  }
}

