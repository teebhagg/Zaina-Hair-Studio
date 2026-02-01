import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { Button } from "@/components/ui/button";
import { AppointmentsClient } from "@/components/appointments/appointments-client";
import AppointmentModel from "@/lib/db/models/Appointment";
import connectDB from "@/lib/db/mongoose";
import { Calendar } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Appointments",
  description: "Manage your appointments.",
};

// Ensure the page is dynamic so it fetches fresh data
export const dynamic = "force-dynamic";

async function getAppointments(page: number = 1, includePast: boolean = false, pastOnly: boolean = false) {
  await connectDB();
  
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build date filter based on filter type
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  
  let dateFilter: any = {};
  if (pastOnly) {
    // Only show past appointments (before today)
    dateFilter.date = { $lt: today };
  } else if (!includePast) {
    // Only show appointments from today onwards (current and future)
    dateFilter.date = { $gte: today };
  }
  // If includePast is true and pastOnly is false, no date filter (show all)

  // Always sort by newest (most recent first)
  const sortObject: Record<string, 1 | -1> = { date: -1, time: -1, createdAt: -1 };

  // Fetch all appointments matching date filter for accurate counting and pagination
  let allAppointments = await AppointmentModel.find(dateFilter)
    .sort(sortObject)
    .lean();

  // Filter by date + time based on filter type
  if (pastOnly) {
    // Filter to only past appointments (before now)
    allAppointments = allAppointments.filter((appt: any) => {
      if (!appt.date) return false;
      const appointmentDate = new Date(appt.date);
      const [hours, minutes] = (appt.time || "00:00").split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      return appointmentDate < now;
    });
  } else if (!includePast) {
    // Filter to only current and future appointments
    allAppointments = allAppointments.filter((appt: any) => {
      if (!appt.date) return false;
      const appointmentDate = new Date(appt.date);
      const [hours, minutes] = (appt.time || "00:00").split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      return appointmentDate >= now;
    });
  }
  // If includePast is true and pastOnly is false, show all (no additional filtering)

  // Get total count after time filtering
  const total = allAppointments.length;

  // Apply pagination
  const appointments = allAppointments.slice(skip, skip + limit);

  // Map appointments with readable dates and dateStatus
  const data = appointments.map((appt: any) => {
    let dateStatus: "past" | "active" | "future" = "future";
    let readableDate = "";
    
    if (appt.date) {
      const appointmentDate = new Date(appt.date);
      const [hours, minutes] = (appt.time || "00:00").split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Determine date status
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appointmentDateOnly = new Date(appointmentDate);
      appointmentDateOnly.setHours(0, 0, 0, 0);
      
      if (appointmentDate < now) {
        dateStatus = "past";
      } else if (appointmentDateOnly.getTime() === today.getTime()) {
        dateStatus = "active";
      } else {
        dateStatus = "future";
      }
      
      // Format date as readable string
      readableDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return {
    id: appt._id.toString(),
    customer: appt.name || appt.email,
    service: appt.serviceName || appt.service,
    date: appt.date ? new Date(appt.date).toISOString().split("T")[0] : "",
      readableDate,
    time: appt.time,
    status: appt.status || "pending",
      dateStatus,
    price: appt.price || 0,
    };
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function AppointmentsPage() {
  const { data, pagination } = await getAppointments(1, false);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageBreadcrumbs />
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <Link href="/dashboard/calendar">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </Link>
      </div>
      <AppointmentsClient initialData={data} initialPagination={pagination} />
    </div>
  );
}
