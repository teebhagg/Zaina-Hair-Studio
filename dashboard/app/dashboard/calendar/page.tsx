import { CalendarPageClient } from "@/components/calendar/calendar-page-client";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import AppointmentModel from "@/lib/db/models/Appointment";
import connectDB from "@/lib/db/mongoose";
import { Metadata } from "next";
import { SyncAllButton } from "@/components/calendar/sync-all-button";

export const metadata: Metadata = {
  title: "Calendar",
  description: "View appointments in calendar format.",
};

// Ensure the page is dynamic so it fetches fresh data
export const dynamic = "force-dynamic";

async function getAppointments() {
  await connectDB();
  const appointments = await AppointmentModel.find({})
    .sort({ date: -1, time: 1 })
    .lean();

  return appointments.map((appt: any) => ({
    id: appt._id.toString(),
    customer: appt.name || appt.email,
    service: appt.serviceName || appt.service,
    date: appt.date ? new Date(appt.date).toISOString().split("T")[0] : "",
    time: appt.time,
    status: appt.status || "pending",
    price: 0,
  }));
}

export default async function CalendarPage() {
  const appointments = await getAppointments();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageBreadcrumbs />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-lg">
            Manage your appointments and schedule
          </p>
        </div>
        <SyncAllButton />
      </div>
      <CalendarPageClient appointments={appointments} />
    </div>
  );
}
