"use server";

import Appointment from "@/lib/db/models/Appointment";
import Customer from "@/lib/db/models/Customer";
import connectDB from "@/lib/db/mongoose";
import { resend } from "@/lib/email/resend";
import { AppointmentConfirmationEmail } from "@/lib/email/templates/appointment-confirmation";
import { AppointmentNotificationEmail } from "@/lib/email/templates/appointment-notification";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import { serviceBySlugQuery } from "@/lib/sanity/queries";
import { appointmentSchema } from "@/lib/validators/appointment";

// Dashboard API URL - in production, use environment variable
const DASHBOARD_API_URL =
  process.env.DASHBOARD_API_URL || "http://localhost:3001";

/**
 * Create a Google Calendar event via the dashboard API
 */
async function createGoogleCalendarAppointment(appointment: any) {
  try {
    // Fetch service details from Sanity to get duration and name
    let serviceName = appointment.serviceName || appointment.service;
    let durationMinutes = 60; // Default duration

    if (isSanityConfigured() && appointment.service) {
      try {
        const service = await client
          .fetch(serviceBySlugQuery("en"), {
            slug: appointment.service,
          })
          .catch(() => null);

        if (service) {
          serviceName = service.name || serviceName;
          durationMinutes = service.duration || durationMinutes;
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        // Continue with defaults
      }
    }

    // Parse date and time to create start/end datetime
    // appointment.date is a Date object, appointment.time is "HH:mm"
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":").map(Number);

    // Create a new date with the correct date and time in local timezone
    const startDateTime = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
      hours,
      minutes,
      0
    );

    const endDateTime = new Date(
      startDateTime.getTime() + durationMinutes * 60 * 1000
    );

    // Build extras summary for event description if present
    let extrasSummary = "";
    if (Array.isArray(appointment.extras) && appointment.extras.length > 0) {
      extrasSummary = `\nExtras: ${appointment.extras.join(", ")}`;
    }

    const eventData = {
      title: `${serviceName} - ${appointment.name}`,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      description: `Customer: ${appointment.name}\nEmail: ${appointment.email}\nPhone: ${appointment.phone}\nService: ${serviceName}${extrasSummary}${appointment.note ? `\nNotes: ${appointment.note}` : ""}`,
    };

    console.log("Creating Google Calendar event:", {
      eventData,
      apiUrl: `${DASHBOARD_API_URL}/api/calendar/events`,
      hasApiKey: !!process.env.SALON_API_KEY,
      dashboardApiUrl: DASHBOARD_API_URL,
    });

    const apiKey = process.env.SALON_API_KEY;

    if (!DASHBOARD_API_URL) {
      console.error("DASHBOARD_API_URL is not set!");
      return null;
    }

    const fullUrl = `${DASHBOARD_API_URL}/api/calendar/events`;
    console.log("Making fetch request to:", fullUrl);

    let response;
    try {
      response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { "x-api-key": apiKey }),
        },
        body: JSON.stringify(eventData),
      });
      console.log("Fetch completed, status:", response.status);
    } catch (fetchError: any) {
      console.error("Fetch error (network/connection issue):", {
        message: fetchError.message,
        code: fetchError.code,
        cause: fetchError.cause,
        url: fullUrl,
      });
      return null;
    }

    const responseText = await response.text();
    console.log("Google Calendar API response:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (!response.ok) {
      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { error: responseText || "Unknown error" };
      }
      console.error("Failed to create Google Calendar event:", error);
      return null;
    }

    const result = JSON.parse(responseText);
    console.log("Google Calendar event created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return null;
  }
}

export async function createAppointment(data: unknown) {
  try {
    const validated = appointmentSchema.parse(data);
    await connectDB();

    // Fetch service details to get serviceType and serviceName
    let serviceType: string | undefined;
    let serviceName: string | undefined;
    if (isSanityConfigured() && validated.service) {
      try {
        const service = await client
          .fetch(serviceBySlugQuery("en"), {
            slug: validated.service,
          })
          .catch(() => null);

        if (service) {
          if (service.serviceType) {
          serviceType = service.serviceType;
          }
          if (service.name) {
            serviceName = service.name;
          }
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      }
    }

    // Validate capacity before creating appointment
    if (serviceType && validated.date && validated.time) {
      const appointmentDate = new Date(validated.date);
      const startOfDayDate = new Date(appointmentDate);
      startOfDayDate.setHours(0, 0, 0, 0);
      const endOfDayDate = new Date(appointmentDate);
      endOfDayDate.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.find({
        date: {
          $gte: startOfDayDate,
          $lte: endOfDayDate,
        },
        time: validated.time,
        status: { $ne: 'cancelled' },
      });

      // Count appointments at this time slot
      const appointmentCount = existingAppointments.length;
      if (appointmentCount >= 4) {
        return {
          success: false,
          error: "This time slot is full. Maximum 4 appointments allowed per time slot.",
        };
      }

      // Count unique service types at this time slot
      const serviceTypes = new Set(
        existingAppointments
          .map((apt) => apt.serviceType)
          .filter((st): st is string => !!st)
      );

      // If we already have 2 service types and the requested type is not one of them, reject
      if (serviceTypes.size >= 2 && !serviceTypes.has(serviceType)) {
        return {
          success: false,
          error: "Maximum 2 service types allowed per time slot. This service type cannot be added to this time slot.",
        };
      }
    }

    // Find or create customer
    let customer = await Customer.findOne({ email: validated.email });
    if (!customer) {
      customer = await Customer.create({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      ...validated,
      date: new Date(validated.date),
      serviceType,
      // Use serviceName from validated data if provided, otherwise use fetched serviceName, fallback to slug
      serviceName: (validated as any).serviceName || serviceName || validated.service,
      customerId: customer._id,
      status: "pending",
    });

    // Update customer appointments
    customer.appointments.push(appointment._id);
    await customer.save();

    // Create a new appointment in Google Calendar from Admin
    // Don't fail appointment creation if Google Calendar fails
    console.log("Attempting to create Google Calendar event for appointment:", {
      appointmentId: appointment._id.toString(),
      name: appointment.name,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
    });

    try {
      const calendarResult = await createGoogleCalendarAppointment(appointment);
      if (calendarResult && calendarResult.eventId) {
        console.log(
          "Google Calendar event created successfully:",
          calendarResult
        );
        // Store the Google Calendar event ID in the appointment
        appointment.googleEventId = calendarResult.eventId;
        await appointment.save();
      } else {
        console.warn(
          "Google Calendar event creation returned null (may have failed silently)"
        );
      }
    } catch (calendarError) {
      console.error("Google Calendar error (non-fatal):", calendarError);
      // Continue with appointment creation even if calendar fails
    }

    // Send confirmation email
    // Note: Email sending requires a verified domain in Resend
    // If domain is not verified, emails will fail silently
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const fromName = process.env.SALON_NAME || "Zainab's Salon";

      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: validated.email,
        subject: "Appointment Confirmation",
        react: AppointmentConfirmationEmail({
          name: validated.name,
          service: validated.service,
          date: validated.date,
          time: validated.time,
        }),
      });

      // Notify admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: adminEmail,
          subject: "New Appointment Booking",
          react: AppointmentNotificationEmail({
            name: validated.name,
            email: validated.email,
            phone: validated.phone,
            service: validated.service,
            date: validated.date,
            time: validated.time,
            note: validated.note,
          }),
        });
      }
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      // Log specific error for debugging domain issues
      if (emailError?.message) {
        console.error("Email error details:", emailError.message);
      }
      // Don't fail the appointment creation if email fails
      // This allows appointments to be created even if Resend domain is not configured
    }

    return { success: true, appointmentId: appointment._id.toString() };
  } catch (error) {
    console.error("Error creating appointment:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create appointment" };
  }
}
