"use client";

import { RescheduleDialog } from "@/components/calendar/reschedule-dialog";
import { SendMessageDialog } from "@/components/calendar/send-message-dialog";
import { AppointmentStatusForm } from "@/components/forms/AppointmentStatusForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AppointmentActionsProps {
  appointmentId: string;
  currentStatus: string;
  currentDate: string | Date;
  currentTime: string;
  customerEmail: string;
  customerName: string;
  service?: string;
}

export function AppointmentActions({
  appointmentId,
  currentStatus,
  currentDate,
  currentTime,
  customerEmail,
  customerName,
  service,
}: AppointmentActionsProps) {
  const router = useRouter();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [statusFormOpen, setStatusFormOpen] = useState(false);

  const handleReschedule = () => {
    router.refresh();
    setRescheduleOpen(false);
  };

  const handleStatusUpdate = async (data: { status: 'pending' | 'approved' | 'completed' | 'cancelled' }) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status }),
      });
      if (res.ok) {
        router.refresh();
        setStatusFormOpen(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const dateString = currentDate instanceof Date 
    ? currentDate.toISOString().split('T')[0]
    : typeof currentDate === 'string' && currentDate.includes('T')
    ? currentDate.split('T')[0]
    : currentDate;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => setStatusFormOpen(true)}
            variant="outline"
            className="w-full"
          >
            Update Status
          </Button>
          <AppointmentStatusForm
            open={statusFormOpen}
            onOpenChange={setStatusFormOpen}
            onSubmit={handleStatusUpdate}
            currentStatus={currentStatus as 'pending' | 'approved' | 'completed' | 'cancelled'}
            appointmentName={customerName}
          />
          {currentStatus !== "cancelled" && (
            <>
              <Separator />
              <Button
                onClick={() => setRescheduleOpen(true)}
                variant="outline"
                className="w-full"
              >
                <CalendarClock className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
              <Button
                onClick={() => setSendMessageOpen(true)}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <RescheduleDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointmentId={appointmentId}
        currentDate={dateString}
        currentTime={currentTime}
        onReschedule={handleReschedule}
      />

      <SendMessageDialog
        open={sendMessageOpen}
        onOpenChange={setSendMessageOpen}
        appointmentId={appointmentId}
        customerEmail={customerEmail}
        customerName={customerName}
        appointmentDate={dateString}
        appointmentTime={currentTime}
        service={service}
      />
    </>
  );
}

