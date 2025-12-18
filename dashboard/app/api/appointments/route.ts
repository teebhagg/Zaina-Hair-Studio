import { auth } from "@/lib/auth";
import Appointment from "@/lib/db/models/Appointment";
import Customer from "@/lib/db/models/Customer";
import connectDB from "@/lib/db/mongoose";
import { appointmentUpdateSchema } from "@/lib/validators/appointment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includePast = searchParams.get("includePast") === "true"; // Show all (past, present, future)
    const pastOnly = searchParams.get("pastOnly") === "true"; // Show only past appointments
    const dateStatus = searchParams.get("dateStatus"); // Filter by date status: "past", "active", "future"
    const skip = (page - 1) * limit;

    // Build date filter based on filter type
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    let dateFilter: any = {};
    if (pastOnly) {
      // Only show past appointments (before now)
      dateFilter.date = { $lt: today };
    } else if (!includePast) {
      // Only show appointments from today onwards (current and future)
      dateFilter.date = { $gte: today };
    }
    // If includePast is true and pastOnly is false, no date filter (show all)

    // Always sort by newest (most recent first) - date descending, time descending
    const sortObject: Record<string, 1 | -1> = {
      date: -1,
      time: -1,
      createdAt: -1,
    };

    // Fetch all appointments matching date filter for accurate counting and pagination
    let allAppointments = await Appointment.find(dateFilter)
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

    // Map appointments with readable dates and dateStatus
    const mappedAppointments = allAppointments.map((appt: any) => {
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
        _raw: appt, // Keep raw data for filtering
      };
    });

    // Filter by dateStatus if provided
    let filteredAppointments = mappedAppointments;
    if (
      dateStatus &&
      (dateStatus === "past" ||
        dateStatus === "active" ||
        dateStatus === "future")
    ) {
      filteredAppointments = mappedAppointments.filter(
        (appt: any) => appt.dateStatus === dateStatus
      );
    }

    // Get total count after status filtering
    const total = filteredAppointments.length;

    // Apply pagination
    const data = filteredAppointments
      .slice(skip, skip + limit)
      .map((appt: any) => {
        // Remove _raw before returning
        const { _raw, ...rest } = appt;
        return rest;
      });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate the request body
    const validated = appointmentUpdateSchema.parse(body);

    await connectDB();

    // Validate capacity before creating appointment
    if (validated.serviceType && validated.date && validated.time) {
      const appointmentDate = new Date(validated.date);
      const startOfDayDate = new Date(appointmentDate);
      startOfDayDate.setHours(0, 0, 0, 0);
      const endOfDayDate = new Date(appointmentDate);
      endOfDayDate.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.find({
        date: {
          $gte: startOfDayDate,
          $lte: endOfDayDate,
        },
        time: validated.time,
        status: { $ne: "cancelled" },
      });

      // Count appointments at this time slot
      const appointmentCount = existingAppointments.length;
      if (appointmentCount >= 4) {
        return NextResponse.json(
          {
            error:
              "This time slot is full. Maximum 4 appointments allowed per time slot.",
          },
          { status: 400 }
        );
      }

      // Count unique service types at this time slot
      const serviceTypes = new Set(
        existingAppointments
          .map((apt) => apt.serviceType)
          .filter((st): st is string => !!st)
      );

      // If we already have 2 service types and the requested type is not one of them, reject
      if (serviceTypes.size >= 2 && !serviceTypes.has(validated.serviceType)) {
        return NextResponse.json(
          {
            error:
              "Maximum 2 service types allowed per time slot. This service type cannot be added to this time slot.",
          },
          { status: 400 }
        );
      }
    }

    // Find or create customer
    let customer = await Customer.findOne({ email: validated.email });
    if (!customer) {
      customer = await Customer.create({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      ...validated,
      date: new Date(validated.date),
      customerId: customer._id,
      status: validated.status || "pending",
    });

    // Update customer appointments
    customer.appointments.push(appointment._id);
    await customer.save();

    // Convert MongoDB document to plain object with proper date formatting
    const appointmentData = {
      ...appointment.toObject(),
      _id: appointment._id.toString(),
      date:
        appointment.date instanceof Date
          ? appointment.date.toISOString().split("T")[0]
          : appointment.date,
      createdAt:
        appointment.createdAt instanceof Date
          ? appointment.createdAt.toISOString()
          : appointment.createdAt,
      updatedAt:
        appointment.updatedAt instanceof Date
          ? appointment.updatedAt.toISOString()
          : appointment.updatedAt,
    };

    return NextResponse.json(appointmentData, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
