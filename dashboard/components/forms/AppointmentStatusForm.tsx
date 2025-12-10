'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  appointmentStatusSchema,
  type AppointmentStatusFormData,
} from '@/lib/validators/appointment'

interface AppointmentStatusFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AppointmentStatusFormData) => Promise<void>
  currentStatus: 'pending' | 'approved' | 'completed' | 'cancelled'
  appointmentName?: string
}

export function AppointmentStatusForm({
  open,
  onOpenChange,
  onSubmit,
  currentStatus,
  appointmentName,
}: AppointmentStatusFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AppointmentStatusFormData>({
    resolver: zodResolver(appointmentStatusSchema),
    defaultValues: {
      status: currentStatus,
      note: '',
    },
  })

  const status = watch('status')

  const onFormSubmit = async (data: AppointmentStatusFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      reset()
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Appointment status updated successfully',
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
          <DialogTitle>Update Appointment Status</DialogTitle>
          <DialogDescription>
            {appointmentName
              ? `Update status for ${appointmentName}'s appointment`
              : 'Update the appointment status'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue('status', value as AppointmentStatusFormData['status'])
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              {...register('note')}
              placeholder="Add a note about this status change..."
              rows={3}
            />
            {errors.note && (
              <p className="text-sm text-destructive mt-1">
                {errors.note.message}
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
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

