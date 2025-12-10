import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import connectDB from '@/lib/db/mongoose'
import Review from '@/lib/db/models/Review'

async function getReviews() {
  try {
    if (!process.env.MONGODB_URI) {
      return []
    }
    await connectDB()
    const reviews = await Review.find({ verified: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    return reviews
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export default async function ReviewsPage() {
  const reviews = await getReviews()

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) /
        reviews.length
      : 0

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Customer Reviews</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See what our customers are saying about us
        </p>
        {reviews.length > 0 && (
          <div className="mt-6">
            <p className="text-3xl font-bold text-primary">
              {averageRating.toFixed(1)} / 5.0
            </p>
            <p className="text-muted-foreground">
              Based on {reviews.length} reviews
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            reviews.map((review: any) => (
              <ReviewCard
                key={review._id.toString()}
                _id={review._id.toString()}
                rating={review.rating}
                text={review.text}
                author={review.author}
                createdAt={review.createdAt}
                replies={review.replies || []}
              />
            ))
          )}
        </div>

        <div>
          <ReviewForm />
        </div>
      </div>
    </div>
  )
}

