'use client'

import { useState, useEffect } from 'react'
import { ReviewCard } from './ReviewCard'

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

interface ReviewsListProps {
  initialReviews: Review[]
  lang: string
}

export function ReviewsList({ initialReviews, lang }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState(false)

  // Sync with initialReviews when they change
  useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

  // Listen for custom event to refresh reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        // Use relative path that works with the lang route
        const res = await fetch(`/${lang}/api/reviews`, {
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    const handleReviewSubmitted = () => {
      // Small delay to ensure database is updated
      setTimeout(() => {
        fetchReviews()
      }, 500)
    }

    window.addEventListener('reviewSubmitted', handleReviewSubmitted)
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted)
    }
  }, [lang])

  if (loading && reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          _id={review._id}
          rating={review.rating}
          text={review.text}
          author={review.author}
          createdAt={review.createdAt}
          replies={review.replies || []}
        />
      ))}
    </div>
  )
}

