import { auth } from "@/lib/auth"
import Review, { IReview } from "@/lib/db/models/Review"
import connectDB from "@/lib/db/mongoose"
import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const review = await Review.findById(id).lean() as (IReview & { _id: mongoose.Types.ObjectId }) | null

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Convert MongoDB document to plain object with proper date formatting
    const reviewData = {
      ...review,
      _id: review._id.toString(),
      createdAt: review.createdAt instanceof Date 
        ? review.createdAt.toISOString() 
        : review.createdAt,
      updatedAt: review.updatedAt instanceof Date 
        ? review.updatedAt.toISOString() 
        : review.updatedAt,
    }

    return NextResponse.json(reviewData)
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const review = await Review.findByIdAndDelete(id)

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Review deleted" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    
    await connectDB()

    // Build update object
    const updateData: any = {}
    
    // Handle verified status update
    if (body.verified !== undefined) {
      updateData.verified = body.verified
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    const review = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean() as (IReview & { _id: mongoose.Types.ObjectId }) | null

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Convert MongoDB document to plain object with proper date formatting
    const reviewData = {
      ...review,
      _id: review._id.toString(),
      createdAt: review.createdAt instanceof Date 
        ? review.createdAt.toISOString() 
        : review.createdAt,
      updatedAt: review.updatedAt instanceof Date 
        ? review.updatedAt.toISOString() 
        : review.updatedAt,
    }

    return NextResponse.json(reviewData)
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    )
  }
}



