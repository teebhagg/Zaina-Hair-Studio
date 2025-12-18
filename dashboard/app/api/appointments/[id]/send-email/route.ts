import { auth } from "@/lib/auth"
import Appointment, { IAppointment } from "@/lib/db/models/Appointment"
import connectDB from "@/lib/db/mongoose"
import { resend, isResendConfigured } from "@/lib/email/resend"
import { CustomerMessageEmail } from "@/lib/email/templates/customer-message"
import { NextRequest, NextResponse } from "next/server"
import { render } from "@react-email/render"
import mongoose from "mongoose"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { message, appointmentDate, appointmentTime, service } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const appointment = await Appointment.findById(id).lean() as (IAppointment & { _id: mongoose.Types.ObjectId }) | null

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const emailHtml = await render(
      CustomerMessageEmail({
        name: appointment.name,
        message: message.trim(),
        appointmentDate: appointmentDate || (appointment.date instanceof Date 
          ? appointment.date.toISOString().split('T')[0] 
          : appointment.date),
        appointmentTime: appointmentTime || appointment.time,
        service: service || appointment.serviceName || appointment.service,
      })
    )

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@zainabssalon.com"
    const salonName = process.env.SALON_NAME || "Zainab's Salon"

    const result = await resend!.emails.send({
      from: `${salonName} <${fromEmail}>`,
      to: appointment.email,
      subject: `Message from ${salonName}`,
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      messageId: result.data?.id || null,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}

