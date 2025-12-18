import mongoose, { Schema, model, models } from 'mongoose'

export interface ITimeOff extends mongoose.Document {
  userId?: string
  startDate: Date
  endDate: Date
  reason?: string
  allDay: boolean // If true, blocks the whole day(s)
  createdAt: Date
  updatedAt: Date
}

const TimeOffSchema = new Schema<ITimeOff>(
  {
    userId: {
      type: String,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficiently querying time-off overlaps
TimeOffSchema.index({ startDate: 1, endDate: 1 })

export default models.TimeOff || model<ITimeOff>('TimeOff', TimeOffSchema)
