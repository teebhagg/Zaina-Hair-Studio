"use client"

import { useState, useEffect, useMemo } from "react"
import { parse } from "date-fns"
import { CalendarView } from "./calendar-view"
import { AppointmentDialog } from "./appointment-dialog"
import { CreateAppointmentDialog } from "./create-appointment-dialog"
import { Appointment } from "@/components/appointments/columns"

interface CalendarPageClientProps {
  appointments: Appointment[]
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
  type?: "appointment" | "google"
  appointmentId?: string | null
  googleEventId?: string | null
}

export function CalendarPageClient({ appointments }: CalendarPageClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [googleEvents, setGoogleEvents] = useState<any[]>([])
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchGoogleEvents() {
      try {
        const res = await fetch('/api/calendar/events')
        if (res.ok) {
          const data = await res.json()
          if (data.events) {
            const events = data.events.map((e: any) => ({
              ...e,
              start: new Date(e.start),
              end: new Date(e.end),
            }))
            setGoogleEvents(events)
          }
        }
      } catch (e) {
        console.error("Failed to fetch google events", e)
      }
    }
    fetchGoogleEvents()
  }, [])

  // Convert appointments to calendar events
  const appointmentEvents = useMemo(() => {
    return appointments.map((appt) => {
      // Parse date and time
      const dateStr = appt.date // YYYY-MM-DD
      const timeStr = appt.time // HH:mm
      const start = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date())
      const end = new Date(start.getTime() + 60 * 60 * 1000) // Default 1 hour

      return {
        id: appt.id,
        title: `${appt.customer} - ${appt.service}`, // service is already mapped to serviceName || service in calendar page
        start,
        end,
        appointmentId: appt.id,
        googleEventId: null,
        color: "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground",
        type: "appointment" as const,
      }
    })
  }, [appointments])

  // Convert Google events to calendar events and try to match with appointments
  const googleCalendarEvents = useMemo(() => {
    return googleEvents.map((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      
      // Try to find matching appointment by date/time (within 5 minutes tolerance)
      const matchingAppointment = appointments.find((appt) => {
        const dateStr = appt.date
        const timeStr = appt.time
        const apptStart = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date())
        const timeDiff = Math.abs(eventStart.getTime() - apptStart.getTime())
        // Match if within 5 minutes
        return timeDiff < 5 * 60 * 1000
      })

      return {
      id: event.id,
      title: event.title,
        start: eventStart,
        end: eventEnd,
        appointmentId: matchingAppointment?.id || null,
        googleEventId: event.id,
        color: "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground",
        type: matchingAppointment ? "appointment" as const : "google" as const,
      }
    })
  }, [googleEvents, appointments])

  // Combine all events, removing duplicates (if Google event matches appointment, prefer appointment)
  const allEvents: CalendarEvent[] = useMemo(() => {
    const eventsMap = new Map<string, CalendarEvent>()
    
    // Add appointment events first
    appointmentEvents.forEach((event) => {
      eventsMap.set(event.id, event)
    })
    
    // Add Google events, but skip if they match an appointment (already added)
    googleCalendarEvents.forEach((event) => {
      if (!event.appointmentId) {
        // Only add Google events that don't have a matching appointment
        eventsMap.set(event.id, event)
      }
    })
    
    return Array.from(eventsMap.values())
  }, [appointmentEvents, googleCalendarEvents])

  const handleEventClick = (event: CalendarEvent) => {
    // Open dialog if there's an appointment ID (either direct appointment or matched Google event)
    if (event.appointmentId) {
      setSelectedAppointmentId(event.appointmentId)
      setDialogOpen(true)
    } else if (event.type === "appointment") {
      setSelectedAppointmentId(event.id)
      setDialogOpen(true)
    } else {
      // For unmatched Google Calendar events, show a message or allow creating appointment
      console.log("Google Calendar event clicked (no matching appointment):", event)
      // Could open create appointment dialog with pre-filled data
    }
  }

  const handleAddEvent = () => {
    setCreateDialogOpen(true)
  }

  const handleUpdate = () => {
    // Refresh the page or refetch appointments
    window.location.reload()
  }

  return (
    <>
      <div className="h-[calc(100vh-120px)] rounded-3xl border-2 border-border/50 bg-card shadow-2xl overflow-hidden">
        <CalendarView
          events={allEvents}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEvent}
          view={view}
          onViewChange={setView}
        />
      </div>
      <AppointmentDialog
        appointmentId={selectedAppointmentId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdate={handleUpdate}
      />
      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialDate={currentDate}
        onCreated={handleUpdate}
      />
    </>
  )
}
