import mongoose, { Schema, model, models } from 'mongoose'

export interface IPromotion extends mongoose.Document {
  title: string
  bannerImage?: string
  shortText: string
  ctaText: string
  ctaLink: string
  active: boolean
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

const PromotionSchema = new Schema<IPromotion>(
  {
    title: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
    },
    shortText: {
      type: String,
      required: true,
    },
    ctaText: {
      type: String,
      default: 'Book Now',
    },
    ctaLink: {
      type: String,
      default: '/book',
    },
    active: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

PromotionSchema.index({ active: 1, startDate: 1, endDate: 1 })

export default models.Promotion || model<IPromotion>('Promotion', PromotionSchema)

