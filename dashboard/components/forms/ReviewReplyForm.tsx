'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { reviewReplySchema, type ReviewReplyFormData } from '@/lib/validators/review'

interface ReviewReplyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ReviewReplyFormData) => Promise<void>
  reviewAuthor?: string
}

export function ReviewReplyForm({
  open,
  onOpenChange,
  onSubmit,
  reviewAuthor,
}: ReviewReplyFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [adminName, setAdminName] = useState<string>('Admin')

  // Fetch admin name when form opens
  useEffect(() => {
    if (open) {
      async function fetchAdminName() {
        try {
          const res = await fetch('/api/admin/me')
          if (res.ok) {
            const data = await res.json()
            setAdminName(data.name || 'Admin')
          }
        } catch (error) {
          console.error('Error fetching admin name:', error)
        }
      }
      fetchAdminName()
    }
  }, [open])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReviewReplyFormData>({
    resolver: zodResolver(reviewReplySchema),
    defaultValues: {
      text: '',
      author: adminName,
    },
  })

  // Update form value when admin name is fetched
  useEffect(() => {
    if (adminName) {
      setValue('author', adminName)
    }
  }, [adminName, setValue])

  const onFormSubmit = async (data: ReviewReplyFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      reset()
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Reply posted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reply to Review</DialogTitle>
          <DialogDescription>
            {reviewAuthor
              ? `Reply to ${reviewAuthor}'s review`
              : 'Write a reply to this review'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="author">Author Name</Label>
            <input
              id="author"
              type="text"
              {...register('author')}
              defaultValue={adminName}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Admin"
            />
            {errors.author && (
              <p className="text-sm text-destructive mt-1">
                {errors.author.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="text">Reply</Label>
            <Textarea
              id="text"
              {...register('text')}
              placeholder="Write your reply..."
              rows={4}
            />
            {errors.text && (
              <p className="text-sm text-destructive mt-1">
                {errors.text.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post Reply'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

