import mongoose, { Schema, model, models } from 'mongoose'

export interface IAppointment extends mongoose.Document {
  name: string
  email: string
  phone: string
  service: string
  serviceName?: string
  serviceType?: string
  extras?: string[]
  date: Date
  time: string
  note?: string
  price?: number
  status: 'pending' | 'approved' | 'completed' | 'cancelled'
  customerId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
    },
    serviceType: {
      type: String,
      description: 'Service type ID or slug (e.g., hair-cut, nail-treatment)',
    },
    extras: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
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

AppointmentSchema.index({ date: 1, time: 1 })
AppointmentSchema.index({ date: 1, time: 1, serviceType: 1 })
AppointmentSchema.index({ email: 1 })

export default models.Appointment || model<IAppointment>('Appointment', AppointmentSchema)

