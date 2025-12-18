import { auth } from "@/lib/auth";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await AvailabilitySettings.findOneAndUpdate(
    { userId: session.user.id },
    { $unset: { googleRefreshToken: 1, googleCalendarId: 1 } }
  );

  return NextResponse.json({ success: true });
}
