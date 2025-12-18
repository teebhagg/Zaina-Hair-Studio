"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  currentDate: string
  currentTime: string
  onReschedule: () => void
}

// Use relative URL since we're in the same app

export function RescheduleDialog({
  open,
  onOpenChange,
  appointmentId,
  currentDate,
  currentTime,
  onReschedule,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate ? parseISO(currentDate) : undefined
  )
  const [selectedTime, setSelectedTime] = useState<string>(currentTime || "")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate) {
        setAvailableSlots([])
        return
      }

      setLoadingSlots(true)
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const res = await fetch(
          `/api/availability/public?date=${dateStr}&duration=60`
        )
        if (res.ok) {
          const data = await res.json()
          setAvailableSlots(data.slots || [])
          // Reset selected time if it's not in available slots
          if (selectedTime && !data.slots?.includes(selectedTime)) {
            setSelectedTime("")
          }
        } else {
          setAvailableSlots([])
        }
      } catch (e) {
        console.error("Availability error", e)
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    const timer = setTimeout(() => {
      fetchAvailability()
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedDate, selectedTime])

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateString,
          time: selectedTime,
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Appointment rescheduled successfully",
        })
        onReschedule()
        onOpenChange(false)
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to reschedule appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-card to-card/50 border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription className="text-base">
            Select a new date and time for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Select 
              value={selectedTime} 
              onValueChange={setSelectedTime}
              disabled={!selectedDate || loadingSlots}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    loadingSlots 
                      ? "Loading available times..." 
                      : !selectedDate 
                        ? "Select a date first" 
                        : "Select a time"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.length > 0 ? (
                  availableSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {selectedDate ? "No available times" : "Select a date first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={loading || !selectedDate || !selectedTime}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Reschedule"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

