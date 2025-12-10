'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { promotionSchema, type PromotionFormData } from '@/lib/validators/promotion'

interface PromotionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PromotionFormData) => Promise<void>
  initialData?: Partial<PromotionFormData>
}

export function PromotionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: PromotionFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: initialData?.title || '',
      bannerImage: initialData?.bannerImage || '',
      shortText: initialData?.shortText || '',
      ctaText: initialData?.ctaText || 'Book Now',
      ctaLink: initialData?.ctaLink || '/book',
      active: initialData?.active ?? true,
      startDate: initialData?.startDate || undefined,
      endDate: initialData?.endDate || undefined,
    },
  })

  const active = watch('active')

  const onFormSubmit = async (data: PromotionFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      reset()
      onOpenChange(false)
      toast({
        title: 'Success',
        description: initialData
          ? 'Promotion updated successfully'
          : 'Promotion created successfully',
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Promotion' : 'New Promotion'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the promotion details below.'
              : 'Create a new promotion to display to customers.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Promotion title"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bannerImage">Banner Image URL (Optional)</Label>
            <Input
              id="bannerImage"
              {...register('bannerImage')}
              placeholder="https://example.com/image.jpg"
            />
            {errors.bannerImage && (
              <p className="text-sm text-destructive mt-1">
                {errors.bannerImage.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="shortText">Short Text</Label>
            <Textarea
              id="shortText"
              {...register('shortText')}
              placeholder="Promotion description"
              rows={3}
            />
            {errors.shortText && (
              <p className="text-sm text-destructive mt-1">
                {errors.shortText.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctaText">CTA Button Text</Label>
              <Input
                id="ctaText"
                {...register('ctaText')}
                placeholder="Book Now"
              />
              {errors.ctaText && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ctaText.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ctaLink">CTA Link</Label>
              <Input
                id="ctaLink"
                {...register('ctaLink')}
                placeholder="/book"
              />
              {errors.ctaLink && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ctaLink.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="active">Status</Label>
            <Select
              value={active ? 'active' : 'inactive'}
              onValueChange={(value) => setValue('active', value === 'active')}
            >
              <SelectTrigger id="active">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
              {isLoading
                ? 'Saving...'
                : initialData
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

