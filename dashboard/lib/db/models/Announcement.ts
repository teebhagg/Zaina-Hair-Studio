import mongoose, { Schema, model, models } from 'mongoose'

export interface IAnnouncement extends mongoose.Document {
  title: string
  message: string
  scheduledDate?: Date
  active: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
)

AnnouncementSchema.index({ active: 1, scheduledDate: 1 })

export default models.Announcement || model<IAnnouncement>('Announcement', AnnouncementSchema)

