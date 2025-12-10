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
import { announcementSchema, type AnnouncementFormData } from '@/lib/validators/announcement'

interface AnnouncementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AnnouncementFormData) => Promise<void>
  initialData?: Partial<AnnouncementFormData>
}

export function AnnouncementForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AnnouncementFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: initialData?.title || '',
      message: initialData?.message || '',
      scheduledDate: initialData?.scheduledDate || undefined,
      active: initialData?.active ?? true,
      priority: initialData?.priority || 'medium',
    },
  })

  const active = watch('active')
  const priority = watch('priority')

  const onFormSubmit = async (data: AnnouncementFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      reset()
      onOpenChange(false)
      toast({
        title: 'Success',
        description: initialData ? 'Announcement updated successfully' : 'Announcement created successfully',
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
          <DialogTitle>
            {initialData ? 'Edit Announcement' : 'New Announcement'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the announcement details below.'
              : 'Create a new announcement to display to customers.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Announcement title"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Announcement message"
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              {...register('scheduledDate')}
            />
            {errors.scheduledDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.scheduledDate.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setValue('priority', value as 'low' | 'medium' | 'high')
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive mt-1">
                  {errors.priority.message}
                </p>
              )}
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

