"use client";

import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { createColumns, Review } from "@/components/reviews/columns";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { ReviewDialog } from "./review-dialog";

interface ReviewsPageClientProps {
  initialReviews: Review[];
}

export function ReviewsPageClient({ initialReviews }: ReviewsPageClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleView = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setDialogOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
        toast({
          title: "Success",
          description: "Review deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete review",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = () => {
    // Refresh reviews
    window.location.reload();
  };

  const columns = createColumns({
    onView: handleView,
    onDelete: handleDelete,
  });

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <PageBreadcrumbs />
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
        </div>
        <DataTable
          data={reviews}
          columns={columns}
          searchKey="name"
          emptyMessage="There are no available reviews."
        />
      </div>
      <ReviewDialog
        reviewId={selectedReviewId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdate={handleUpdate}
      />
    </>
  );
}
