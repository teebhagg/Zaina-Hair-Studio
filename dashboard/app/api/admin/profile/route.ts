import { auth } from "@/lib/auth";
import Admin from "@/lib/db/models/Admin";
import connectDB from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    await connectDB();

    const admin = await Admin.findById(session.user.id);
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Update fields
    admin.name = validated.name;
    admin.email = validated.email.toLowerCase().trim();

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}



