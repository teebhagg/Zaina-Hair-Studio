import { AppointmentTable } from "@/components/dashboard/AppointmentTable";
import Appointment from "@/lib/db/models/Appointment";
import connectDB from "@/lib/db/mongoose";

async function getAppointments() {
  try {
    if (!process.env.MONGODB_URI) {
      return [];
    }
    await connectDB();
    const appointments = await Appointment.find()
      .sort({ date: -1, createdAt: -1 })
      .lean();
    return appointments.map((apt: any) => ({
      ...apt,
      _id: apt._id.toString(),
      date: apt.date.toString(),
      createdAt: apt.createdAt.toString(),
    }));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>1. Home</span>
          <span>/</span>
          <span className="text-foreground">Appointments</span>
        </nav>
        <h1 className="text-4xl font-bold mb-2">Appointment List</h1>
      </div>
      <AppointmentTable appointments={appointments} />
    </div>
  );
}
