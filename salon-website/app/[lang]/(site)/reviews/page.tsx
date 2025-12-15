import { ReviewsPageClient } from '@/components/reviews/ReviewsPageClient'
import connectDB from '@/lib/db/mongoose'
import Review from '@/lib/db/models/Review'
import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { locales, defaultLocale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

async function getReviews() {
  try {
    if (!process.env.MONGODB_URI) {
      return []
    }
    await connectDB()
    // Show all reviews (both verified and unverified) so new ones appear immediately
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    return reviews.map((review: any) => ({
      _id: review._id.toString(),
      rating: review.rating,
      text: review.text,
      author: review.author,
      createdAt: review.createdAt instanceof Date 
        ? review.createdAt.toISOString() 
        : review.createdAt,
      replies: review.replies || [],
    }))
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  
  if (!lang || !hasLocale(lang)) {
    notFound()
  }
  
  const dict = await getDictionary(lang)
  const reviews = await getReviews()

  return <ReviewsPageClient initialReviews={reviews} lang={lang} dict={dict} />
}
