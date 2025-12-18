import { auth } from "@/lib/auth";
import AvailabilitySettings from "@/lib/db/models/AvailabilitySettings";
import connectDB from "@/lib/db/mongoose";
import { oauth2Client } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Only update refresh_token if it's returned
    const updateData: any = { userId: session.user.id };
    if (tokens.refresh_token) {
      updateData.googleRefreshToken = tokens.refresh_token;
    }

    await connectDB();

    // Find or update settings
    await AvailabilitySettings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.redirect(new URL("/dashboard/settings?success=google_connected", req.url));
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/dashboard/settings?error=google_failed", req.url));
  }
}
