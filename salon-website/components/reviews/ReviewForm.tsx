'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewSchema, type ReviewFormData } from '@/lib/validators/review'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { submitReview } from '@/app/actions/reviews'

export function ReviewForm() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      text: '',
      author: '',
      email: '',
    },
  })

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await submitReview({ ...data, rating })
      if (result.success) {
        toast({
          title: 'Thank you!',
          description: 'Your review has been submitted successfully.',
        })
        reset()
        setRating(0)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit review',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-2 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      i < (hoveredRating || rating)
                        ? 'fill-primary text-primary'
                        : 'fill-none text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">
                {errors.rating.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="author">Your Name</Label>
            <Input
              id="author"
              {...register('author')}
              placeholder="John Doe"
            />
            {errors.author && (
              <p className="text-sm text-destructive mt-1">
                {errors.author.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="text">Your Review</Label>
            <Textarea
              id="text"
              {...register('text')}
              placeholder="Share your experience..."
              rows={5}
            />
            {errors.text && (
              <p className="text-sm text-destructive mt-1">
                {errors.text.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

