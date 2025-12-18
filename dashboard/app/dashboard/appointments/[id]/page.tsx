import { AppointmentActions } from "@/components/appointments/appointment-actions";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Appointment, { IAppointment } from "@/lib/db/models/Appointment";
import connectDB from "@/lib/db/mongoose";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, DollarSign, FileText, Mail, Phone, Scissors, User, XCircle } from "lucide-react";
import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getAppointment(id: string) {
  await connectDB();
  const appointment = await Appointment.findById(id).lean() as (IAppointment & { _id: mongoose.Types.ObjectId }) | null;

  if (!appointment) {
    return null;
  }

  return {
    _id: appointment._id.toString(),
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    service: appointment.service,
    serviceName: appointment.serviceName || appointment.service,
    extras: appointment.extras || [],
    date: appointment.date,
    time: appointment.time,
    note: appointment.note,
    price: appointment.price || 0,
    status: appointment.status,
    customerId: appointment.customerId?.toString(),
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

export default async function AppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointment(id);

  if (!appointment) {
    notFound();
  }

  const appointmentDate = new Date(appointment.date);
  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-600 border-green-500/20",
    completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const statusIcons = {
    pending: AlertCircle,
    approved: CheckCircle2,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const StatusIcon = statusIcons[appointment.status] || AlertCircle;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageBreadcrumbs />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/appointments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
            <p className="text-muted-foreground">
              View and manage appointment information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${statusColors[appointment.status]} flex items-center gap-2 px-3 py-1`}
          >
            <StatusIcon className="h-3 w-3" />
            <span className="capitalize">{appointment.status}</span>
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </p>
                  <p className="font-medium text-lg">{appointment.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </p>
                  <a
                    href={`mailto:${appointment.email}`}
                    className="font-medium text-lg hover:text-primary transition-colors"
                  >
                    {appointment.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </p>
                  <a
                    href={`tel:${appointment.phone}`}
                    className="font-medium text-lg hover:text-primary transition-colors"
                  >
                    {appointment.phone}
                  </a>
                </div>
                {appointment.customerId && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium text-lg font-mono text-sm">
                      {appointment.customerId}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Service
                  </p>
                  <p className="font-medium text-lg">{appointment.serviceName}</p>
                  {appointment.service !== appointment.serviceName && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {appointment.service}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </p>
                  <p className="font-medium text-lg">
                    {format(appointmentDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(appointmentDate, "yyyy-MM-dd")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </p>
                  <p className="font-medium text-lg">{appointment.time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price
                  </p>
                  <p className="font-medium text-lg">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(appointment.price)}
                  </p>
                </div>
              </div>

              {appointment.extras && appointment.extras.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Extras</p>
                    <div className="flex flex-wrap gap-2">
                      {appointment.extras.map((extra, index) => (
                        <Badge key={index} variant="secondary">
                          {extra}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {appointment.note && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                    </p>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                      {appointment.note}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {format(new Date(appointment.createdAt), "PPpp")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(appointment.updatedAt), "PPpp")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <AppointmentActions
            appointmentId={appointment._id}
            currentStatus={appointment.status}
            currentDate={appointment.date}
            currentTime={appointment.time}
            customerEmail={appointment.email}
            customerName={appointment.name}
            service={appointment.serviceName}
          />

          {/* Appointment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{appointment.serviceName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="font-medium">
                  {format(appointmentDate, "MMM d")} at {appointment.time}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Price</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(appointment.price)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={`${statusColors[appointment.status]} flex items-center gap-1`}
                >
                  <StatusIcon className="h-3 w-3" />
                  <span className="capitalize">{appointment.status}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

