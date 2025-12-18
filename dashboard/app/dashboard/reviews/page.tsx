import { Review } from "@/components/reviews/columns";
import { ReviewsPageClient } from "@/components/reviews/reviews-page-client";
import ReviewModel from "@/lib/db/models/Review";
import connectDB from "@/lib/db/mongoose";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Manage customer reviews.",
};

export const dynamic = "force-dynamic";

async function getReviews(): Promise<Review[]> {
  try {
    await connectDB();
    const reviews = await ReviewModel.find({}).sort({ createdAt: -1 }).lean();

    return reviews.map((review: any) => ({
      id: review._id.toString(),
      name: review.author || "Anonymous",
      rating: review.rating,
      comment: review.text || "",
      date:
        review.createdAt instanceof Date
          ? review.createdAt.toISOString().split("T")[0]
          : review.createdAt,
      status: review.verified ? "published" : "pending",
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export default async function ReviewsPage() {
  const data = await getReviews();

  return <ReviewsPageClient initialReviews={data} />;
}
