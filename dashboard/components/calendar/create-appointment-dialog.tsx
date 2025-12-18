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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { CalendarIcon, Loader2, User, Mail, Phone, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: Date
  onCreated: () => void
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  initialDate,
  onCreated,
}: CreateAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate || new Date()
  )
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Array<{ _id: string; name: string; slug: { current: string }; price?: number; duration?: number; serviceType?: string }>>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    serviceName: "",
    note: "",
  })
  const { toast } = useToast()

  // Fetch services when dialog opens
  useEffect(() => {
    if (open) {
      async function fetchServices() {
        setLoadingServices(true)
        try {
          const res = await fetch('/api/services')
          if (res.ok) {
            const data = await res.json()
            setServices(data.services || [])
          }
        } catch (e) {
          console.error("Error fetching services:", e)
        } finally {
          setLoadingServices(false)
        }
      }
      fetchServices()
    }
  }, [open])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedDate(initialDate || new Date())
      setSelectedTime("")
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        serviceName: "",
        note: "",
      })
      setAvailableSlots([])
    }
  }, [open, initialDate])

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !formData.service) {
        setAvailableSlots([])
        return
      }

      const selectedService = services.find(s => s.slug.current === formData.service)
      if (!selectedService) {
        setAvailableSlots([])
        return
      }

      setLoadingSlots(true)
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const params = new URLSearchParams({
          date: dateStr,
          duration: String(selectedService.duration || 60),
        })
        if (selectedService.serviceType) {
          params.append('serviceType', selectedService.serviceType)
        }
        const res = await fetch(
          `/api/availability/public?${params.toString()}`
        )
        if (res.ok) {
          const data = await res.json()
          setAvailableSlots(data.slots || [])
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
  }, [selectedDate, formData.service, services])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.service) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      
      const selectedService = services.find(s => s.slug.current === formData.service)
      
      const res = await fetch(`/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          serviceName: formData.serviceName || formData.service,
          serviceType: selectedService?.serviceType,
          date: dateString,
          time: selectedTime,
          note: formData.note || undefined,
          status: "approved",
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Appointment created successfully",
        })
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          serviceName: "",
          note: "",
        })
        setSelectedTime("")
        onCreated()
        onOpenChange(false)
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Create New Appointment
          </DialogTitle>
          <DialogDescription className="text-base">
            Add a new appointment to the calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service" className="flex items-center gap-1">
                  <Scissors className="h-3 w-3" />
                  Service *
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => {
                    const selectedService = services.find(s => s.slug.current === value)
                    setFormData({ 
                      ...formData, 
                      service: value,
                      serviceName: selectedService?.name || ""
                    })
                  }}
                  disabled={loadingServices}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        loadingServices 
                          ? "Loading services..." 
                          : "Select a service"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {services.length > 0 ? (
                      services.map((service) => (
                        <SelectItem key={service._id} value={service.slug.current}>
                          {service.name}
                          {service.price ? ` - $${service.price}` : ""}
                          {service.duration ? ` (${service.duration} min)` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        {loadingServices ? "Loading..." : "No services available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
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
                      captionLayout="dropdown"
                      className="rounded-md border shadow-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time *</Label>
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
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  service: "",
                  serviceName: "",
                  note: "",
                })
                setSelectedTime("")
                onOpenChange(false)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading || 
                !selectedDate || 
                !selectedTime || 
                !formData.name || 
                !formData.email || 
                !formData.phone || 
                !formData.service
              }
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Appointment"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

