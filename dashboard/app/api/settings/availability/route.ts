import { auth } from "@/lib/auth";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  // Explicitly select refresh token to check existence, but don't return it to frontend
  const settingsDoc = await AvailabilitySettings.findOne({ userId: session.user.id }).select('+googleRefreshToken');
  
  const settings = settingsDoc ? settingsDoc.toObject() : {};
  const isGoogleConnected = !!settings.googleRefreshToken;
  
  // Remove sensitive token before sending
  delete settings.googleRefreshToken;

  return NextResponse.json({ ...settings, isGoogleConnected });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Validate body structure briefly if needed, or rely on frontend + schema
  if (!body.workDays || !Array.isArray(body.workDays)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await connectDB();
  
  const settings = await AvailabilitySettings.findOneAndUpdate(
    { userId: session.user.id },
    {
       userId: session.user.id,
       workDays: body.workDays
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(settings);
}
