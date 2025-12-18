import { auth } from "@/lib/auth";
import Appointment from "@/lib/db/models/Appointment";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { calendar, oauth2Client } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import { serviceBySlugQuery } from "@/lib/sanity/queries";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const settings = await AvailabilitySettings.findOne({
      userId: session.user.id,
    }).select("+googleRefreshToken");

    if (!settings?.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Fetch service details to get duration and name
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
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":").map(Number);

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
      summary: `${serviceName} - ${appointment.name}`,
      description: `Customer: ${appointment.name}\nEmail: ${appointment.email}\nPhone: ${appointment.phone}\nService: ${serviceName}${extrasSummary}${appointment.note ? `\nNotes: ${appointment.note}` : ""}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken });

    let eventId: string;
    let action: "created" | "updated";

    if (appointment.googleEventId) {
      // Update existing event
      try {
        const response = await calendar.events.update({
          calendarId: "primary",
          eventId: appointment.googleEventId,
          requestBody: eventData,
        });
        eventId = response.data.id || appointment.googleEventId;
        action = "updated";
        console.log("Google Calendar event updated successfully:", eventId);
      } catch (error: any) {
        // If event doesn't exist (404), create a new one
        if (error.response?.status === 404) {
          console.log(
            "Event not found, creating new event:",
            appointment.googleEventId
          );
          const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: eventData,
          });
          eventId = response.data.id || "";
          action = "created";
          appointment.googleEventId = eventId;
          await appointment.save();
          console.log("Google Calendar event created successfully:", eventId);
        } else {
          throw error;
        }
      }
    } else {
      // Create new event
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventData,
      });
      eventId = response.data.id || "";
      action = "created";
      appointment.googleEventId = eventId;
      await appointment.save();
      console.log("Google Calendar event created successfully:", eventId);
    }

    return NextResponse.json({
      success: true,
      action,
      eventId,
      message: `Google Calendar event ${action} successfully`,
    });
  } catch (error: any) {
    console.error("Error syncing with Google Calendar:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to sync with Google Calendar",
        details: error.message,
        response: error.response?.data,
      },
      { status: 500 }
    );
  }
}

