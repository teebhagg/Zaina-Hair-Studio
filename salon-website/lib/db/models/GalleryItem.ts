import mongoose, { Schema, model, models } from 'mongoose'

export interface IGalleryItem extends mongoose.Document {
  imageUrl: string
  caption?: string
  category: 'hair' | 'nails' | 'makeup' | 'spa' | 'general'
  featured: boolean
  sanityId?: string
  createdAt: Date
  updatedAt: Date
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    category: {
      type: String,
      enum: ['hair', 'nails', 'makeup', 'spa', 'general'],
      default: 'general',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sanityId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

GalleryItemSchema.index({ category: 1, featured: 1 })

export default models.GalleryItem || model<IGalleryItem>('GalleryItem', GalleryItemSchema)

