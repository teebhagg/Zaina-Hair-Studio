import { auth } from "@/lib/auth"
import { client, isSanityConfigured } from "@/lib/sanity/client"
import { servicesQuery } from "@/lib/sanity/queries"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isSanityConfigured()) {
      return NextResponse.json({ services: [] })
    }

    const services = await client.fetch(servicesQuery()).catch(() => [])

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}



