import { auth } from "@/lib/auth";
import Admin from "@/lib/db/models/Admin";
import connectDB from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const admin = await Admin.findById(session.user.id).select("-password");

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
    });
  } catch (error) {
    console.error("Error fetching admin info:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin info" },
      { status: 500 }
    );
  }
}

