import { auth } from "@/lib/auth";
import Appointment, { IAppointment } from "@/lib/db/models/Appointment";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { calendar, oauth2Client } from "@/lib/google";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import { serviceBySlugQuery } from "@/lib/sanity/queries";
import { appointmentStatusSchema } from "@/lib/validators/appointment";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const appointment = (await Appointment.findById(id).lean()) as
      | (IAppointment & { _id: mongoose.Types.ObjectId })
      | null;

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Convert MongoDB document to plain object with proper date formatting
    const appointmentData = {
      ...appointment,
      _id: appointment._id.toString(),
      date:
        appointment.date instanceof Date
          ? appointment.date.toISOString().split("T")[0]
          : appointment.date,
      createdAt:
        appointment.createdAt instanceof Date
          ? appointment.createdAt.toISOString()
          : appointment.createdAt,
      updatedAt:
        appointment.updatedAt instanceof Date
          ? appointment.updatedAt.toISOString()
          : appointment.updatedAt,
    };

    return NextResponse.json(appointmentData);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    // Build update object
    const updateData: any = {};

    // Handle status update
    if (body.status) {
      const validated = appointmentStatusSchema.parse({ status: body.status });
      updateData.status = validated.status;
    }

    // Handle date/time reschedule
    if (body.date) {
      updateData.date = new Date(body.date);
    }
    if (body.time) {
      updateData.time = body.time;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Sync with Google Calendar if date/time was updated
    if (body.date || body.time) {
      try {
        const settings = await AvailabilitySettings.findOne({
          userId: session.user.id,
        }).select("+googleRefreshToken");

        if (settings?.googleRefreshToken) {
          // Fetch service details to get duration and name
          let serviceName = appointment.serviceName || appointment.service;
          let durationMinutes = 60; // Default duration

          if (isSanityConfigured() && appointment.service) {
            try {
              const service = await client
                .fetch(serviceBySlugQuery(), {
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
          if (
            Array.isArray(appointment.extras) &&
            appointment.extras.length > 0
          ) {
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

          oauth2Client.setCredentials({
            refresh_token: settings.googleRefreshToken,
          });

          if (appointment.googleEventId) {
            // Update existing event
            try {
              await calendar.events.update({
                calendarId: "primary",
                eventId: appointment.googleEventId,
                requestBody: eventData,
              });
              console.log(
                "Google Calendar event updated successfully:",
                appointment.googleEventId
              );
            } catch (error: any) {
              // If event doesn't exist (404), create a new one
              if (error.response?.status === 404) {
                console.log("Event not found, creating new event");
                const response = await calendar.events.insert({
                  calendarId: "primary",
                  requestBody: eventData,
                });
                appointment.googleEventId = response.data.id || "";
                await appointment.save();
                console.log(
                  "Google Calendar event created successfully:",
                  appointment.googleEventId
                );
              } else {
                console.error("Error updating Google Calendar event:", error);
              }
            }
          } else {
            // Create new event
            const response = await calendar.events.insert({
              calendarId: "primary",
              requestBody: eventData,
            });
            appointment.googleEventId = response.data.id || "";
            await appointment.save();
            console.log(
              "Google Calendar event created successfully:",
              appointment.googleEventId
            );
          }
        }
      } catch (calendarError) {
        console.error("Google Calendar sync error (non-fatal):", calendarError);
        // Continue with appointment update even if calendar sync fails
      }
    }

    // Convert MongoDB document to plain object with proper date formatting
    const appointmentData = {
      ...appointment.toObject(),
      _id: appointment._id.toString(),
      date:
        appointment.date instanceof Date
          ? appointment.date.toISOString().split("T")[0]
          : appointment.date,
      createdAt:
        appointment.createdAt instanceof Date
          ? appointment.createdAt.toISOString()
          : appointment.createdAt,
      updatedAt:
        appointment.updatedAt instanceof Date
          ? appointment.updatedAt.toISOString()
          : appointment.updatedAt,
    };

    return NextResponse.json(appointmentData);
  } catch (error) {
    console.error("Error updating appointment:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
