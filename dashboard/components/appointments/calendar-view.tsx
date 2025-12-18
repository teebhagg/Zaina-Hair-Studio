"use client"

import { format, getDay, parse, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Appointment } from './columns'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarViewProps {
  appointments: Appointment[]
}

export function CalendarView({ appointments }: CalendarViewProps) {
  const [googleEvents, setGoogleEvents] = useState<any[]>([])

  useEffect(() => {
    async function fetchGoogleEvents() {
        try {
            const res = await fetch('/api/calendar/events')
            if (res.ok) {
                const data = await res.json()
                if (data.events) {
                    // Convert string dates back to Date objects
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

  const localEvents = appointments.map(app => {
    // Combine date and time to create start date object
    // DB stores date as YYYY-MM-DD and time as HH:mm (24h)
    const start = parse(`${app.date} ${app.time}`, 'yyyy-MM-dd HH:mm', new Date())
    const end = new Date(start.getTime() + 60 * 60 * 1000) // Default 1 hour duration

    return {
      title: `${app.customer} (${app.service})`,
      start,
      end,
      resource: app,
      type: 'appointment'
    }
  })

  const allEvents = [...localEvents, ...googleEvents]

  const eventStyleGetter = (event: any) => {
    let backgroundColor = 'hsl(var(--primary))'
    if (event.type === 'google') {
        backgroundColor = '#4285F4' // Google Blue
    }
    return {
        style: {
            backgroundColor
        }
    }
  }

  return (
    <div className="h-[600px] w-full bg-background p-4 rounded-md border text-foreground">
        {/* Custom styling wrapper to match shadcn theme slightly better */}
        <style jsx global>{`
            .rbc-calendar {
                font-family: inherit;
            }
            .rbc-toolbar button {
                border: 1px solid hsl(var(--border));
                color: hsl(var(--foreground));
                border-radius: 0.375rem; /* rounded-md */
            }
            .rbc-toolbar button:hover {
                background-color: hsl(var(--accent));
                color: hsl(var(--accent-foreground));
            }
            .rbc-toolbar button.rbc-active {
                background-color: hsl(var(--primary));
                color: hsl(var(--primary-foreground));
                border-color: hsl(var(--primary));
            }
            .rbc-off-range-bg {
                background-color: hsl(var(--muted));
            }
        `}</style>
      <Calendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView='week'
        eventPropGetter={eventStyleGetter}
      />
    </div>
  )
}
