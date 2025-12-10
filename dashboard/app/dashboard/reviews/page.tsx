import { ReviewsTable } from "@/components/dashboard/ReviewsTable";
import Review from "@/lib/db/models/Review";
import connectDB from "@/lib/db/mongoose";

async function getReviews() {
  try {
    if (!process.env.MONGODB_URI) {
      return [];
    }
    await connectDB();
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    return reviews.map((review: any) => ({
      ...review,
      _id: review._id.toString(),
      createdAt: review.createdAt.toString(),
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>1. Home</span>
          <span>/</span>
          <span className="text-foreground">Reviews</span>
        </nav>
        <h1 className="text-4xl font-bold mb-2">Review List</h1>
      </div>

      <ReviewsTable reviews={reviews as any} />
    </div>
  );
}
