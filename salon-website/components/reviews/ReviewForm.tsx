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
import { submitReview } from '@/app/[lang]/actions/reviews'
import { useTranslation } from 'react-i18next'

export function ReviewForm() {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  })

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast({
        title: t('reviews.ratingRequired'),
        description: t('reviews.pleaseSelectRating'),
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await submitReview({ ...data, rating })
      if (result.success) {
        toast({
          title: t('reviews.thankYou'),
          description: t('reviews.reviewSubmitted'),
        })
        reset()
        setRating(0)
        // Dispatch custom event to refresh reviews list
        window.dispatchEvent(new Event('reviewSubmitted'))
      } else {
        toast({
          title: t('reviews.error'),
          description: result.error || t('reviews.failedToSubmit'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: t('reviews.error'),
        description: t('reviews.somethingWentWrong'),
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reviews.submit')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="author">{t('reviews.name')}</Label>
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
            <Label htmlFor="email">{t('reviews.email')}</Label>
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
            <Label>{t('reviews.rating')}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star)
                    setValue('rating', star)
                  }}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
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
            <Label htmlFor="text">{t('reviews.comment')} *</Label>
            <Textarea
              id="text"
              {...register('text')}
              placeholder={t('reviews.shareExperience')}
              rows={4}
            />
            {errors.text && (
              <p className="text-sm text-destructive mt-1">
                {errors.text.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t('reviews.submitting') : t('reviews.submitButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
