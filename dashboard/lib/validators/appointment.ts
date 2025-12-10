import { z } from 'zod'

export const appointmentStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'completed', 'cancelled']),
  note: z.string().max(500, 'Note must be less than 500 characters').optional(),
})

export type AppointmentStatusFormData = z.infer<typeof appointmentStatusSchema>

export const appointmentUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters'),
  service: z.string().min(1, 'Service is required'),
  serviceName: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  note: z.string().max(500, 'Note must be less than 500 characters').optional(),
  status: z.enum(['pending', 'approved', 'completed', 'cancelled']).default('pending'),
})

export type AppointmentUpdateFormData = z.infer<typeof appointmentUpdateSchema>

