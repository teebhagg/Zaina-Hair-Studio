import Appointment from "@/lib/db/models/Appointment";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { calendar, oauth2Client } from "@/lib/google";
import { addMinutes, endOfDay, format, isAfter, isBefore, parse, startOfDay } from 'date-fns';
import { NextRequest, NextResponse } from "next/server";

// Helper to check overlap
function isOverlap(start: Date, end: Date, events: any[]) {
  // Add slight buffer?
  return events.some(event => {
    const eStart = new Date(event.start);
    const eEnd = new Date(event.end);
    // (StartA <= EndB) and (EndA >= StartB)
    return isBefore(start, eEnd) && isAfter(end, eStart);
  });
}

export async function GET(req: NextRequest) {
  // CORS check - in production you'd limit this
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  const duration = parseInt(searchParams.get("duration") || "60");
  const serviceType = searchParams.get("serviceType"); // Service type ID or slug

  if (!dateStr) {
    return NextResponse.json({ error: "Missing date" }, { status: 400, headers });
  }

  try {
    await connectDB();
    // Assuming single admin for now, or fetch by specific user if multi-tenant
    const settings = await AvailabilitySettings.findOne({}).select('+googleRefreshToken').sort({ updatedAt: -1 });

    if (!settings) {
         return NextResponse.json({ slots: [] }, { headers });
    }

    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const dayOfWeek = format(date, 'EEEE'); // Monday, Tuesday...

    const daySettings = settings.workDays.find((d: any) => d.day === dayOfWeek);

    if (!daySettings || !daySettings.isOpen) {
        return NextResponse.json({ slots: [] }, { headers });
    }

    // Work Hours
    const workStart = parse(`${dateStr} ${daySettings.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const workEnd = parse(`${dateStr} ${daySettings.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

    // Google Events
    let blockedPeriods: { start: Date, end: Date }[] = [];
    
    if (settings.googleRefreshToken) {
        try {
            oauth2Client.setCredentials({ refresh_token: settings.googleRefreshToken });
            const googleRes = await calendar.events.list({
                calendarId: 'primary',
                timeMin: startOfDay(date).toISOString(),
                timeMax: endOfDay(date).toISOString(),
                singleEvents: true,
            });
            const gEvents = googleRes.data.items || [];
            console.log(`Found ${gEvents.length} Google Calendar events for ${dateStr}`);
            
            gEvents.forEach((ev: any) => {
                if (ev.start?.dateTime && ev.end?.dateTime) {
                    const eventStart = new Date(ev.start.dateTime);
                    const eventEnd = new Date(ev.end.dateTime);
                    blockedPeriods.push({
                        start: eventStart,
                        end: eventEnd
                    });
                    console.log(`Blocked by Google Calendar: ${format(eventStart, 'yyyy-MM-dd HH:mm')} - ${format(eventEnd, 'HH:mm')} (${ev.summary || 'Untitled'})`);
                } else if (ev.start?.date) {
                    // All-day events
                    const eventDate = new Date(ev.start.date);
                    blockedPeriods.push({
                        start: startOfDay(eventDate),
                        end: endOfDay(eventDate)
                    });
                    console.log(`Blocked by Google Calendar (all-day): ${format(eventDate, 'yyyy-MM-dd')} (${ev.summary || 'Untitled'})`);
                }
            });
        } catch (e) {
            console.error("Google Calendar error:", e);
        }
    } else {
        console.log("Google Calendar not connected - skipping Google Calendar events");
    }

    // Existing Appointments
    // Appointment.date is a Date object, so we need to query by date range
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);
    
    const appointments = await Appointment.find({
      date: {
        $gte: startOfDayDate,
        $lte: endOfDayDate,
      },
      status: { $ne: 'cancelled' }
    });
    
    console.log(`Found ${appointments.length} appointments for ${dateStr}`);
    
    // Group appointments by time slot for capacity checking
    // Key: "HH:mm", Value: { count: number, serviceTypes: Set<string> }
    const timeSlotCapacity = new Map<string, { count: number; serviceTypes: Set<string> }>();
    
    appointments.forEach((appt: any) => {
        // appt.date is a Date object, appt.time is a string like "14:30" (24h format from the form)
        const appointmentDate = new Date(appt.date);
        
        // Parse time - it should be in HH:mm format (24h) from the appointment form
        const [hours, minutes] = appt.time.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) {
            console.warn(`Invalid time format for appointment: ${appt.time}`);
            return;
        }
        
        // Use the time string directly as the key (it's already in HH:mm format)
        const timeKey = appt.time;
        
        // Track capacity for this time slot
        if (!timeSlotCapacity.has(timeKey)) {
          timeSlotCapacity.set(timeKey, { count: 0, serviceTypes: new Set() });
        }
        const slot = timeSlotCapacity.get(timeKey)!;
        slot.count++;
        if (appt.serviceType) {
          slot.serviceTypes.add(appt.serviceType);
        }
        
        const finalStart = new Date(appointmentDate);
        finalStart.setHours(hours, minutes, 0, 0);

        // Use the duration from the request parameter, or default to 60 minutes
        const apptDuration = duration || 60;
        const end = addMinutes(finalStart, apptDuration);

        blockedPeriods.push({ start: finalStart, end });
        console.log(`Blocked period from appointment: ${format(finalStart, 'yyyy-MM-dd HH:mm')} - ${format(end, 'HH:mm')} (${appt.name || 'Appointment'})`);
    });

    // Generate Slots
    // 30 min intervals
    const slots = [];
    let current = workStart;

    while (isBefore(addMinutes(current, duration), workEnd) || current.getTime() === workEnd.getTime()) {
        const slotEnd = addMinutes(current, duration);
        
        // Check if slot overlaps with any blocked period
        // Also check if slotEnd is after workEnd
        if (isAfter(slotEnd, workEnd)) {
            break;
        }

        // Check if slot overlaps with blocked periods (Google Calendar, existing appointments)
        if (isOverlap(current, slotEnd, blockedPeriods)) {
            current = addMinutes(current, 30);
            continue;
        }

        // Check capacity constraints if serviceType is provided
        const timeKey = format(current, 'HH:mm');
        if (serviceType) {
          const slotCapacity = timeSlotCapacity.get(timeKey) || { count: 0, serviceTypes: new Set<string>() };
          
          // Rule 1: Max 4 appointments per time slot
          if (slotCapacity.count >= 4) {
            console.log(`Slot ${timeKey} is full (${slotCapacity.count}/4 appointments)`);
            current = addMinutes(current, 30);
            continue;
          }
          
          // Rule 2: Max 2 service types per time slot
          // If we already have 2 service types and the requested type is not one of them, skip
          if (slotCapacity.serviceTypes.size >= 2 && !slotCapacity.serviceTypes.has(serviceType)) {
            console.log(`Slot ${timeKey} has max service types (${slotCapacity.serviceTypes.size}/2), and ${serviceType} is not one of them`);
            current = addMinutes(current, 30);
            continue;
          }
        }

        slots.push(format(current, 'HH:mm'));
        current = addMinutes(current, 30);
    }

    return NextResponse.json({ slots }, { headers });

  } catch (error) {
    console.error("Availability API Error", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500, headers });
  }
}

export async function OPTIONS(req: NextRequest) {
   return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
