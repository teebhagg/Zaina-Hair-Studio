import { auth } from "@/lib/auth"
import Review from "@/lib/db/models/Review"
import connectDB from "@/lib/db/mongoose"
import { reviewReplySchema } from "@/lib/validators/review"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
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
    
    // Validate the request body
    const validated = reviewReplySchema.parse(body)
    
    await connectDB()

    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Use admin name from session, fallback to validated author or "Admin"
    const adminName = session.user.name || validated.author || "Admin"

    // Add reply to the review
    review.replies.push({
      text: validated.text,
      author: adminName,
      createdAt: new Date(),
    })

    await review.save()

    // Return updated review
    const updatedReview = await Review.findById(id).lean()
    const reviewData = {
      ...updatedReview,
      _id: updatedReview!._id.toString(),
      createdAt: updatedReview!.createdAt instanceof Date 
        ? updatedReview!.createdAt.toISOString() 
        : updatedReview!.createdAt,
      updatedAt: updatedReview!.updatedAt instanceof Date 
        ? updatedReview!.updatedAt.toISOString() 
        : updatedReview!.updatedAt,
    }

    return NextResponse.json(reviewData)
  } catch (error) {
    console.error("Error adding reply to review:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to add reply" },
      { status: 500 }
    )
  }
}

