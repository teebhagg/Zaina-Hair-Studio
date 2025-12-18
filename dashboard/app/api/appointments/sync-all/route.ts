import { auth } from "@/lib/auth";
import Appointment from "@/lib/db/models/Appointment";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { calendar, oauth2Client } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";
import { client, isSanityConfigured } from "@/lib/sanity/client";
import { serviceBySlugQuery } from "@/lib/sanity/queries";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const settings = await AvailabilitySettings.findOne({
      userId: session.user.id,
    }).select("+googleRefreshToken");

    if (!settings?.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Fetch all appointments
    const appointments = await Appointment.find({}).lean();

    oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken });

    // Fetch all Google Calendar events (past 1 year to future 2 years for comprehensive sync)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

    let allGoogleEvents: any[] = [];
    let nextPageToken: string | undefined = undefined;

    // Fetch all events with pagination
    do {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: oneYearAgo.toISOString(),
        timeMax: twoYearsFromNow.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        pageToken: nextPageToken,
        maxResults: 2500, // Maximum per page
      });

      if (response.data.items) {
        allGoogleEvents = allGoogleEvents.concat(response.data.items);
      }

      nextPageToken = response.data.nextPageToken || undefined;
    } while (nextPageToken);

    console.log(`Fetched ${allGoogleEvents.length} Google Calendar events`);

    // Create a map of Google Calendar events by ID for quick lookup
    const googleEventsById = new Map<string, any>();
    allGoogleEvents.forEach((event) => {
      if (event.id) {
        googleEventsById.set(event.id, event);
      }
    });

    // Create a map of appointments by googleEventId
    const appointmentsByGoogleEventId = new Map<string, any>();
    appointments.forEach((appt) => {
      if ((appt as any).googleEventId) {
        appointmentsByGoogleEventId.set((appt as any).googleEventId, appt);
      }
    });

    // Track which Google Calendar events are matched
    const matchedGoogleEventIds = new Set<string>();

    const results = {
      total: appointments.length,
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: 0,
      errorsList: [] as string[],
    };

    // Process each appointment
    for (const appointment of appointments) {
      try {
        // Fetch service details to get duration and name
        let serviceName = (appointment as any).serviceName || appointment.service;
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

        const appointmentDoc = await Appointment.findById(appointment._id);
        if (!appointmentDoc) {
          results.skipped++;
          continue;
        }

        const googleEventId = (appointmentDoc as any).googleEventId;

        if (googleEventId && googleEventsById.has(googleEventId)) {
          // Update existing matched event
          try {
            await calendar.events.update({
              calendarId: "primary",
              eventId: googleEventId,
              requestBody: eventData,
            });
            matchedGoogleEventIds.add(googleEventId);
            results.updated++;
            console.log(
              "Google Calendar event updated successfully:",
              googleEventId
            );
          } catch (error: any) {
            // If event doesn't exist (404), create a new one
            if (error.response?.status === 404) {
              console.log(
                "Event not found, creating new event:",
                googleEventId
              );
              const response = await calendar.events.insert({
                calendarId: "primary",
                requestBody: eventData,
              });
              (appointmentDoc as any).googleEventId = response.data.id || "";
              await appointmentDoc.save();
              matchedGoogleEventIds.add(response.data.id || "");
              results.created++;
              console.log(
                "Google Calendar event created successfully:",
                response.data.id
              );
            } else {
              throw error;
            }
          }
        } else {
          // Try to match by date/time if no googleEventId
          let matched = false;
          if (!googleEventId) {
            // Find matching Google Calendar event by date/time (within 5 minutes tolerance)
            for (const [eventId, googleEvent] of googleEventsById.entries()) {
              if (matchedGoogleEventIds.has(eventId)) continue; // Already matched

              const eventStart = googleEvent.start?.dateTime
                ? new Date(googleEvent.start.dateTime)
                : null;
              
              if (eventStart) {
                const timeDiff = Math.abs(
                  startDateTime.getTime() - eventStart.getTime()
                );
                // Match if within 5 minutes and title contains appointment name or service
                if (timeDiff < 5 * 60 * 1000) {
                  const eventTitle = googleEvent.summary || "";
                  if (
                    eventTitle.includes(appointment.name) ||
                    eventTitle.includes(serviceName)
                  ) {
                    // Update the matched event
                    try {
                      await calendar.events.update({
                        calendarId: "primary",
                        eventId: eventId,
                        requestBody: eventData,
                      });
                      (appointmentDoc as any).googleEventId = eventId;
                      await appointmentDoc.save();
                      matchedGoogleEventIds.add(eventId);
                      results.updated++;
                      matched = true;
                      console.log(
                        `Matched and updated Google Calendar event ${eventId} for appointment ${appointment._id}`
                      );
                      break;
                    } catch (error: any) {
                      console.error(
                        `Error updating matched event ${eventId}:`,
                        error
                      );
                    }
                  }
                }
              }
            }
          }

          // Create new event if no match found
          if (!matched) {
            const response = await calendar.events.insert({
              calendarId: "primary",
              requestBody: eventData,
            });
            (appointmentDoc as any).googleEventId = response.data.id || "";
            await appointmentDoc.save();
            matchedGoogleEventIds.add(response.data.id || "");
            results.created++;
            console.log(
              "Google Calendar event created successfully:",
              response.data.id
            );
          }
        }
      } catch (error: any) {
        console.error(
          `Error syncing appointment ${appointment._id}:`,
          error
        );
        results.errors++;
        results.errorsList.push(
          `Appointment ${appointment._id}: ${error.message || "Unknown error"}`
        );
      }
    }

    // Delete Google Calendar events that don't match any appointment
    for (const [eventId, googleEvent] of googleEventsById.entries()) {
      if (!matchedGoogleEventIds.has(eventId)) {
        // Check if this event looks like it was created by our system
        // (contains customer info in description or matches our title pattern)
        const description = googleEvent.description || "";
        const summary = googleEvent.summary || "";
        const looksLikeAppointment =
          description.includes("Customer:") ||
          description.includes("Email:") ||
          summary.includes(" - "); // Our pattern: "Service - Customer"

        if (looksLikeAppointment) {
          try {
            await calendar.events.delete({
              calendarId: "primary",
              eventId: eventId,
            });
            results.deleted++;
            console.log(
              `Deleted unmatched Google Calendar event: ${eventId} (${summary})`
            );
          } catch (error: any) {
            console.error(`Error deleting event ${eventId}:`, error);
            results.errors++;
            results.errorsList.push(
              `Failed to delete event ${eventId}: ${error.message || "Unknown error"}`
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.created + results.updated} appointments, deleted ${results.deleted} excess events`,
      results,
    });
  } catch (error: any) {
    console.error("Error syncing all appointments with Google Calendar:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to sync appointments with Google Calendar",
        details: error.message,
        response: error.response?.data,
      },
      { status: 500 }
    );
  }
}

