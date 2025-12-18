import { auth } from "@/lib/auth";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { calendar, oauth2Client } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
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

    const body = await req.json();
    const { title, start, end, description } = body;

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields: title, start, end" },
        { status: 400 }
      );
    }

    oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken });

    const startDate = new Date(start);
    const endDate = new Date(end);

    const event = {
      summary: title,
      description: description || "",
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    console.log("Updating Google Calendar event:", eventId, event);

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody: event,
    });

    console.log("Google Calendar event updated successfully:", response.data.id);

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      event: response.data,
    });
  } catch (error: any) {
    console.error("Google Calendar update event error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to update calendar event",
        details: error.message,
        response: error.response?.data,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
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

    oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken });

    console.log("Deleting Google Calendar event:", eventId);

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    console.log("Google Calendar event deleted successfully:", eventId);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error("Google Calendar delete event error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to delete calendar event",
        details: error.message,
        response: error.response?.data,
      },
      { status: 500 }
    );
  }
}

