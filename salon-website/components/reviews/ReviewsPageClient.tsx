'use client'

import { useState, useEffect } from 'react'
import { ReviewForm } from './ReviewForm'
import { ReviewsList } from './ReviewsList'
import { useTranslation } from 'react-i18next'

interface Review {
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

interface ReviewsPageClientProps {
  initialReviews: Review[]
  lang: string
  dict: any
}

export function ReviewsPageClient({ initialReviews, lang, dict }: ReviewsPageClientProps) {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) /
        reviews.length
      : 0

  // Listen for review submission to update the list
  useEffect(() => {
    const handleReviewSubmitted = async () => {
      // Small delay to ensure database is updated
      setTimeout(async () => {
        try {
          const res = await fetch(`/${lang}/api/reviews`, {
            cache: 'no-store',
          })
          if (res.ok) {
            const data = await res.json()
            setReviews(data.reviews || [])
          }
        } catch (error) {
          console.error('Error fetching reviews:', error)
        }
      }, 500)
    }

    window.addEventListener('reviewSubmitted', handleReviewSubmitted)
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted)
    }
  }, [lang])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">{dict.reviews.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {dict.reviews.subtitle}
        </p>
        {reviews.length > 0 && (
          <div className="mt-6">
            <p className="text-3xl font-bold text-primary">
              {averageRating.toFixed(1)} / 5.0
            </p>
            <p className="text-muted-foreground">
              {dict.reviews.basedOn?.replace('{count}', reviews.length.toString()) || `Based on ${reviews.length} reviews`}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ReviewsList initialReviews={reviews} lang={lang} />
        </div>

        <div>
          <ReviewForm />
        </div>
      </div>
    </div>
  )
}

