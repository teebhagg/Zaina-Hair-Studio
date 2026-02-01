"use client"

import { useState, useMemo, useEffect } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addDays } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

interface CalendarViewProps {
  events: CalendarEvent[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onAddEvent?: () => void
  view: "month" | "week" | "day"
  onViewChange: (view: "month" | "week" | "day") => void
}

export function CalendarView({
  events,
  currentDate,
  onDateChange,
  onEventClick,
  onAddEvent,
  view,
  onViewChange,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate)

  // Sync selectedDate with currentDate prop
  useEffect(() => {
    setSelectedDate(currentDate)
  }, [currentDate])

  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })

  const navigateDate = (direction: "prev" | "next") => {
    let newDate: Date
    if (view === "month") {
      newDate = addDays(monthStart, direction === "next" ? 32 : -2)
    } else if (view === "week") {
      newDate = addDays(weekStart, direction === "next" ? 7 : -7)
    } else {
      newDate = addDays(selectedDate, direction === "next" ? 1 : -1)
    }
    setSelectedDate(newDate)
    onDateChange(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    onDateChange(today)
  }

  const monthDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 })
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [monthStart, monthEnd])

  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [weekStart, weekEnd])

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      return isSameDay(eventStart, date)
    })
  }

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(date)
      slotEnd.setHours(hour + 1, 0, 0, 0)
      
      return (
        (eventStart >= slotStart && eventStart < slotEnd) ||
        (eventEnd > slotStart && eventEnd <= slotEnd) ||
        (eventStart <= slotStart && eventEnd >= slotEnd)
      )
    })
  }

  const renderMonthView = () => {
    const weekDaysHeader = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDaysHeader.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = isSameMonth(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const isSelected = isSameDay(day, selectedDate)

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[140px] rounded-2xl p-3 cursor-pointer transition-all duration-200 border-2",
                  "hover:shadow-lg hover:scale-[1.02] hover:border-primary/30",
                  !isCurrentMonth && "opacity-30 bg-muted/20 border-muted",
                  isCurrentMonth && !isToday && !isSelected && "bg-card border-border hover:bg-accent/20",
                  isSelected && "ring-2 ring-primary ring-offset-2 border-primary bg-primary/5 shadow-md",
                  isToday && !isSelected && "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-sm"
                )}
                onClick={() => {
                  setSelectedDate(day)
                  onDateChange(day)
                }}
              >
                <div className={cn(
                  "text-base font-bold mb-3 transition-colors",
                  isToday && "text-primary",
                  isSelected && "text-primary",
                  !isToday && !isSelected && "text-foreground"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-2">
                  {dayEvents.slice(0, 3).map((event, eventIdx) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs px-3 py-2 rounded-xl truncate cursor-pointer transition-all duration-200",
                        "hover:scale-[1.02] hover:shadow-md font-medium",
                        event.color || "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-sm"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                    >
                      <span className="font-semibold">
                        {format(new Date(event.start), "HH:mm")}
                      </span>{" "}
                      <span className="opacity-95">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground font-semibold px-3 py-1.5 bg-muted/50 rounded-xl">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex-1 overflow-auto rounded-lg border bg-card">
        <div className="grid grid-cols-8 gap-px border-b bg-border/50">
          <div className="sticky left-0 z-20 bg-gradient-to-b from-background to-muted/30 border-r-2 border-primary/20 p-4 shadow-sm">
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Time</div>
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className={cn(
              "text-center border-b bg-gradient-to-b from-background to-muted/10 p-4",
              isSameDay(day, new Date()) && "bg-gradient-to-b from-primary/10 to-primary/5 border-primary/30"
            )}>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{format(day, "EEE")}</div>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                isSameDay(day, new Date()) && "text-primary"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-px bg-border/30">
          <div className="sticky left-0 z-10 bg-gradient-to-b from-background to-muted/20 border-r-2 border-primary/20">
            {hours.map((hour) => {
              // Calculate max height needed for this hour across all days
              let maxHeight = 80 // Base height
              weekDays.forEach((day) => {
                const slotEvents = getEventsForTimeSlot(day, hour)
                if (slotEvents.length > 0) {
                  const totalEventHeight = slotEvents.length * 70 + (slotEvents.length - 1) * 8 + 16 // 70px per event + 8px gap + 16px padding
                  maxHeight = Math.max(maxHeight, totalEventHeight)
                }
              })
              
              return (
                <div 
                  key={hour} 
                  className="border-b border-border/50 p-3 text-xs text-muted-foreground font-semibold flex items-start"
                  style={{ minHeight: `${maxHeight}px` }}
                >
                {String(hour).padStart(2, '0')}:00
              </div>
              )
            })}
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="relative bg-background">
              {hours.map((hour) => {
                const slotEvents = getEventsForTimeSlot(day, hour)
                // Calculate max height needed for this hour across all days (same as time column)
                let maxHeight = 80
                weekDays.forEach((d) => {
                  const events = getEventsForTimeSlot(d, hour)
                  if (events.length > 0) {
                    const totalEventHeight = events.length * 70 + (events.length - 1) * 8 + 16
                    maxHeight = Math.max(maxHeight, totalEventHeight)
                  }
                })

                return (
                  <div
                    key={hour}
                    className="border-b border-l border-border/30 hover:bg-accent/20 transition-colors relative group flex flex-col gap-2 p-2"
                    style={{ minHeight: `${maxHeight}px` }}
                  >
                    {slotEvents.map((event) => {
                      const eventStart = new Date(event.start)
                      const eventEnd = new Date(event.end)

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-xl text-xs cursor-pointer",
                            "shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.01]",
                            "border-l-4 border-l-primary/80 flex-shrink-0",
                            event.color || "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground"
                          )}
                          onClick={() => onEventClick?.(event)}
                        >
                          <div className="font-bold mb-1 break-words">{event.title}</div>
                          <div className="text-xs opacity-90 font-medium">
                            {format(eventStart, "HH:mm")} - {format(eventEnd, "HH:mm")}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex-1 overflow-auto rounded-lg border bg-card">
        <div className="grid grid-cols-2 gap-px border-b bg-border/50">
          <div className="sticky left-0 z-20 bg-gradient-to-b from-background to-muted/30 border-r-2 border-primary/20 p-4 shadow-sm">
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Time</div>
          </div>
          <div className="text-center border-b bg-gradient-to-b from-background to-muted/10 p-4">
            <div className="text-xl font-bold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border/30">
          <div className="sticky left-0 z-10 bg-gradient-to-b from-background to-muted/20 border-r-2 border-primary/20">
            {hours.map((hour) => {
              const slotEvents = getEventsForTimeSlot(selectedDate, hour)
              // Calculate height needed for this slot
              const slotHeight = slotEvents.length > 0 
                ? Math.max(80, slotEvents.length * 80 + (slotEvents.length - 1) * 12)
                : 80
              
              return (
                <div 
                  key={hour} 
                  className="border-b border-border/50 p-3 text-xs text-muted-foreground font-semibold flex items-start"
                  style={{ minHeight: `${slotHeight}px` }}
                >
                {String(hour).padStart(2, '0')}:00
              </div>
              )
            })}
          </div>
          <div className="relative bg-background">
            {hours.map((hour) => {
              const slotEvents = getEventsForTimeSlot(selectedDate, hour)
              // Calculate height needed for this slot
              const slotHeight = slotEvents.length > 0 
                ? Math.max(80, slotEvents.length * 80 + (slotEvents.length - 1) * 12)
                : 80

              return (
                <div
                  key={hour}
                  className="border-b border-l border-border/30 hover:bg-accent/20 transition-colors relative group flex flex-col gap-3 p-2"
                  style={{ minHeight: `${slotHeight}px` }}
                >
                  {slotEvents.map((event) => {
                    const eventStart = new Date(event.start)
                    const eventEnd = new Date(event.end)

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "p-3 rounded-xl text-sm cursor-pointer",
                          "shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.01]",
                          "border-l-4 border-l-primary/80 flex-shrink-0",
                          event.color || "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground"
                        )}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="font-bold mb-1 break-words">{event.title}</div>
                        <div className="text-xs opacity-90 font-medium">
                          {format(eventStart, "HH:mm")} - {format(eventEnd, "HH:mm")}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/5">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-background to-muted/10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateDate("prev")} 
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateDate("next")} 
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday} 
            className="h-9 px-4 rounded-lg font-semibold border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all"
          >
            Today
          </Button>
          <div className="text-2xl font-bold ml-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {view === "month" && format(selectedDate, "MMMM yyyy")}
            {view === "week" && `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`}
            {view === "day" && format(selectedDate, "EEEE, MMMM d, yyyy")}
          </div>
          {view === "month" && (
            <div className="text-sm text-muted-foreground ml-3 px-3 py-1.5 bg-primary/10 rounded-full font-semibold border border-primary/20">
              {events.length} events
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0 border-2 border-primary/20 rounded-2xl p-1 bg-muted/30 backdrop-blur-sm">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("month")}
              className={cn(
                "h-8 px-4 rounded-lg font-semibold transition-all",
                view === "month" && "shadow-md"
              )}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("week")}
              className={cn(
                "h-8 px-4 rounded-lg font-semibold transition-all",
                view === "week" && "shadow-md"
              )}
            >
              Week
            </Button>
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("day")}
              className={cn(
                "h-8 px-4 rounded-lg font-semibold transition-all",
                view === "day" && "shadow-md"
              )}
            >
              Day
            </Button>
          </div>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => window.open('https://calendar.google.com', '_blank')}
            className="h-9 w-9 rounded-lg border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all"
            title="Open Google Calendar"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          {onAddEvent && (
            <Button 
              onClick={onAddEvent} 
              size="sm" 
              className="h-9 px-4 rounded-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>
      
      {/* Calendar Content */}
      <div className="flex-1 overflow-auto p-6">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>
    </div>
  )
}
