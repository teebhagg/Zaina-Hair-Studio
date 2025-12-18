"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppointmentStatusForm } from "@/components/forms/AppointmentStatusForm";
import { RescheduleDialog } from "@/components/calendar/reschedule-dialog";
import { SendMessageDialog } from "@/components/calendar/send-message-dialog";
import { CalendarClock, Send } from "lucide-react";

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

  const handleReschedule = () => {
    router.refresh();
    setRescheduleOpen(false);
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
          <AppointmentStatusForm
            appointmentId={appointmentId}
            currentStatus={currentStatus as any}
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

