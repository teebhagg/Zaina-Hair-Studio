import mongoose, { Schema, model, models } from 'mongoose'

/**
 * Customer Model
 * 
 * Customers are separate from Users (admin).
 * - Users: Only Zainab (admin) - has password, can login to dashboard
 * - Customers: Created automatically when booking appointments - no password, no login access
 * 
 * Customers are stored in the Customer collection, not the User collection.
 */
export interface ICustomer extends mongoose.Document {
  name: string
  email: string
  phone: string
  appointments: mongoose.Types.ObjectId[]
  reviews: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    appointments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
  }
)

CustomerSchema.index({ email: 1 })

export default models.Customer || model<ICustomer>('Customer', CustomerSchema)

