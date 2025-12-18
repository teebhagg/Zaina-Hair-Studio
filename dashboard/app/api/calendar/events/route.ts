import { auth } from "@/lib/auth";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { calendar, oauth2Client } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const settings = await AvailabilitySettings.findOne({
    userId: session.user.id,
  }).select("+googleRefreshToken");

  if (!settings?.googleRefreshToken) {
    return NextResponse.json({ events: [] }); // Not connected
  }

  try {
    oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken });

    // Fetch events for current month (or a wide range)
    // For simplicity, fetching next 30 days. Better to use query params start/end
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: nextMonth.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Transform to our CalendarView format
    const transformedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.summary || "Google Event",
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      allDay: !event.start.dateTime, // If no time, it's all day
      type: "google",
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error("Google Calendar API error", error);
    // If refresh token invalid, ideally disconnect user
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("=== CALENDAR EVENTS POST ENDPOINT HIT ===");
  console.log("Request received at:", new Date().toISOString());
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);

  try {
    // Check for API key in header for salon-website requests
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = process.env.SALON_API_KEY;

    console.log("Calendar event creation request:", {
      hasApiKey: !!apiKey,
      hasExpectedApiKey: !!expectedApiKey,
      apiKeyMatch: apiKey === expectedApiKey,
      apiKeyLength: apiKey?.length,
      expectedApiKeyLength: expectedApiKey?.length,
    });

    // Allow either authenticated session OR valid API key
    const session = await auth();
    const isAuthenticated =
      session?.user?.id ||
      (apiKey && expectedApiKey && apiKey === expectedApiKey);

    if (!isAuthenticated) {
      console.error("Unauthorized request - no valid session or API key");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // If using API key, find first admin with Google Calendar connected
    // Otherwise, use the session user's settings
    let settings;
    if (apiKey && expectedApiKey && apiKey === expectedApiKey) {
      console.log(
        "Using API key authentication, finding first admin with Google Calendar"
      );
      settings = await AvailabilitySettings.findOne({
        googleRefreshToken: { $exists: true, $ne: null },
      })
        .select("+googleRefreshToken")
        .sort({ createdAt: 1 });
    } else {
      console.log("Using session authentication");
      settings = await AvailabilitySettings.findOne({
        userId: session?.user.id,
      }).select("+googleRefreshToken");
    }

    if (!settings?.googleRefreshToken) {
      console.error("Google Calendar not connected for user");
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    console.log("Found settings with Google Calendar token");

    const body = await req.json();
    const { title, start, end, description } = body;

    console.log("Event data received:", { title, start, end, description });

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields: title, start, end" },
        { status: 400 }
      );
    }

    oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken });

    // Use the timezone from the date strings (they're already in ISO format)
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

    console.log("Creating Google Calendar event:", event);

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    console.log(
      "Google Calendar event created successfully:",
      response.data.id
    );

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      event: response.data,
    });
  } catch (error: any) {
    console.error("Google Calendar create event error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to create calendar event",
        details: error.message,
        response: error.response?.data,
      },
      { status: 500 }
    );
  }
}
