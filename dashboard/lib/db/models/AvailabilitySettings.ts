import mongoose, { Schema, model, models } from 'mongoose'

export interface IAvailabilitySettings extends mongoose.Document {
  userId?: string // Optional for now, assuming single admin initially
  workDays: {
    day: string // "monday", "tuesday", etc.
    isOpen: boolean
    startTime: string // "09:00"
    endTime: string // "17:00"
  }[]
  googleRefreshToken?: string
  googleCalendarId?: string
  createdAt: Date
  updatedAt: Date
}

const AvailabilitySettingsSchema = new Schema<IAvailabilitySettings>(
  {
    userId: {
      type: String,
      index: true,
    },
    workDays: [
      {
        day: { type: String, required: true },
        isOpen: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
      },
    ],
    googleRefreshToken: {
      type: String,
      select: false, // Don't return by default for security
    },
    googleCalendarId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default models.AvailabilitySettings || model<IAvailabilitySettings>('AvailabilitySettings', AvailabilitySettingsSchema)
