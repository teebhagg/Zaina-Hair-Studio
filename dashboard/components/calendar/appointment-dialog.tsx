"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Calendar,
  CalendarClock,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Mail,
  Phone,
  Scissors,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RescheduleDialog } from "./reschedule-dialog";
import { SendMessageDialog } from "./send-message-dialog";

interface AppointmentDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  serviceName?: string;
  date: string;
  time: string;
  note?: string;
  price?: number;
  status: "pending" | "approved" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface AppointmentDialogProps {
  appointmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function AppointmentDialog({
  appointmentId,
  open,
  onOpenChange,
  onUpdate,
}: AppointmentDialogProps) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointment();
    } else {
      setAppointment(null);
    }
  }, [open, appointmentId]);

  const fetchAppointment = async () => {
    if (!appointmentId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointment(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointment details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast({
        title: "Error",
        description: "Failed to fetch appointment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async () => {
    if (!appointmentId || !appointment) return;

    if (
      !confirm(
        `Are you sure you want to cancel this appointment for ${appointment.name}?`
      )
    ) {
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAppointment(updated);
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
        });
        onUpdate?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const appointmentDate = appointment?.date
    ? typeof appointment.date === "string"
      ? new Date(appointment.date)
      : appointment.date
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[66vh] flex flex-col bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : appointment ? (
          <>
            {/* Fixed Header */}
            <DialogHeader className="sticky top-0 z-20 bg-gradient-to-br rounded-t-3xl from-card to-card/50 border-b border-border/50 p-6 pr-12 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Appointment Details
                </DialogTitle>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={getStatusVariant(appointment.status)}
                    className="text-sm font-semibold px-3 py-1 capitalize">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
              <DialogDescription className="text-base">
                View and manage appointment information
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-6 py-4">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{appointment.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="font-medium">{appointment.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </p>
                      <p className="font-medium">{appointment.phone}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Scissors className="h-3 w-3" />
                        Service
                      </p>
                      <p className="font-medium">
                        {appointment.serviceName || appointment.service}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date
                      </p>
                      <p className="font-medium">
                        {appointmentDate
                          ? format(appointmentDate, "EEEE, MMMM d, yyyy")
                          : appointment.date}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Time
                      </p>
                      <p className="font-medium">{appointment.time}</p>
                    </div>
                    {appointment.price !== undefined &&
                      appointment.price > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Price
                          </p>
                          <p className="font-medium">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(appointment.price)}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {appointment.note && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Notes
                      </h3>
                      <p className="text-sm text-muted-foreground pl-7 bg-muted/30 p-3 rounded-lg">
                        {appointment.note}
                      </p>
                    </div>
                  </>
                )}

                <Separator className="bg-border/50" />

                {/* Actions */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {appointment.status !== "cancelled" && (
                      <>
                        <Button
                          onClick={() => setRescheduleOpen(true)}
                          disabled={updating}
                          variant="outline"
                          className="flex-1">
                          <CalendarClock className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                        <Button
                          onClick={() => setSendMessageOpen(true)}
                          disabled={updating}
                          className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </>
                    )}
                    {appointment.status !== "cancelled" && (
                      <Button
                        onClick={cancelAppointment}
                        disabled={updating}
                        variant="destructive"
                        className="flex-1">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Appointment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No appointment selected
          </div>
        )}
      </DialogContent>

      {appointment && (
        <>
          <RescheduleDialog
            open={rescheduleOpen}
            onOpenChange={setRescheduleOpen}
            appointmentId={appointmentId || ""}
            currentDate={appointment.date}
            currentTime={appointment.time}
            onReschedule={() => {
              fetchAppointment();
              onUpdate?.();
            }}
          />
          <SendMessageDialog
            open={sendMessageOpen}
            onOpenChange={setSendMessageOpen}
            appointmentId={appointmentId || ""}
            customerEmail={appointment.email}
            customerName={appointment.name}
            appointmentDate={appointment.date}
            appointmentTime={appointment.time}
            service={appointment.serviceName || appointment.service}
          />
        </>
      )}
    </Dialog>
  );
}
