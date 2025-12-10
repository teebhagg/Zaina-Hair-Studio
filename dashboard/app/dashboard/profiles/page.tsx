import { ProfilesTable } from "@/components/dashboard/ProfilesTable";
import { Button } from "@/components/ui/button";
import Customer from "@/lib/db/models/Customer";
import connectDB from "@/lib/db/mongoose";
import { Download } from "lucide-react";

async function getCustomers() {
  try {
    if (!process.env.MONGODB_URI) {
      return [];
    }

    await connectDB();
    const customers = await Customer.find().sort({ createdAt: -1 }).lean();

    return customers.map((customer: any) => ({
      ...customer,
      _id: customer._id.toString(),
      createdAt: customer.createdAt?.toString(),
      updatedAt: customer.updatedAt?.toString(),
      appointmentsCount: Array.isArray(customer.appointments)
        ? customer.appointments.length
        : 0,
      reviewsCount: Array.isArray(customer.reviews)
        ? customer.reviews.length
        : 0,
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export default async function ProfilesPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>1. Home</span>
          <span>/</span>
          <span className="text-foreground">Profiles</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-1">Profiles</h1>
            <p className="text-sm text-muted-foreground">
              Manage your customers and their activity.
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <ProfilesTable customers={customers as any} />
    </div>
  );
}


