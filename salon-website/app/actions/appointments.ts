'use server'

import connectDB from '@/lib/db/mongoose'
import Appointment from '@/lib/db/models/Appointment'
import Customer from '@/lib/db/models/Customer'
import { appointmentSchema } from '@/lib/validators/appointment'
import { resend } from '@/lib/email/resend'
import { AppointmentConfirmationEmail } from '@/lib/email/templates/appointment-confirmation'
import { AppointmentNotificationEmail } from '@/lib/email/templates/appointment-notification'

export async function createAppointment(data: unknown) {
  try {
    const validated = appointmentSchema.parse(data)
    await connectDB()

    // Find or create customer
    let customer = await Customer.findOne({ email: validated.email })
    if (!customer) {
      customer = await Customer.create({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
      })
    }

    // Create appointment
    const appointment = await Appointment.create({
      ...validated,
      date: new Date(validated.date),
      customerId: customer._id,
      status: 'pending',
    })

    // Update customer appointments
    customer.appointments.push(appointment._id)
    await customer.save()

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Zainab\'s Salon <noreply@zainabssalon.com>',
        to: validated.email,
        subject: 'Appointment Confirmation',
        react: AppointmentConfirmationEmail({
          name: validated.name,
          service: validated.service,
          date: validated.date,
          time: validated.time,
        }),
      })

      // Notify admin
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        await resend.emails.send({
          from: 'Zainab\'s Salon <noreply@zainabssalon.com>',
          to: adminEmail,
          subject: 'New Appointment Booking',
          react: AppointmentNotificationEmail({
            name: validated.name,
            email: validated.email,
            phone: validated.phone,
            service: validated.service,
            date: validated.date,
            time: validated.time,
            note: validated.note,
          }),
        })
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the appointment creation if email fails
    }

    return { success: true, appointmentId: appointment._id.toString() }
  } catch (error) {
    console.error('Error creating appointment:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create appointment' }
  }
}

