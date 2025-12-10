import mongoose, { Schema, model, models } from 'mongoose'

export interface IReviewReply {
  text: string
  author: string
  createdAt: Date
}

export interface IReview extends mongoose.Document {
  rating: number
  text: string
  author: string
  email?: string
  verified: boolean
  replies: IReviewReply[]
  customerId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ReviewReplySchema = new Schema<IReviewReply>(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      default: 'Admin',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const ReviewSchema = new Schema<IReview>(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    replies: {
      type: [ReviewReplySchema],
      default: [],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
  {
    timestamps: true,
  }
)

ReviewSchema.index({ rating: 1, createdAt: -1 })
ReviewSchema.index({ verified: 1 })

export default models.Review || model<IReview>('Review', ReviewSchema)

