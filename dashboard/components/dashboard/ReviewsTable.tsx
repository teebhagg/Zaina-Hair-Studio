"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, MoreHorizontal, Star } from "lucide-react";

interface ReviewItem {
  _id: string;
  author: string;
  email?: string;
  rating: number;
  text: string;
  createdAt: string;
  verified?: boolean;
}

interface ReviewsTableProps {
  reviews: ReviewItem[];
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredReviews = reviews.filter((review) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "verified") return !!review.verified;
    if (statusFilter === "pending") return !review.verified;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  const toggleRowSelection = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRows(next);
  };

  const toggleAllSelection = () => {
    if (
      selectedRows.size === paginatedReviews.length &&
      paginatedReviews.length > 0
    ) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedReviews.map((r) => r._id)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reviews</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and moderate customer reviews
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
                setSelectedRows(new Set());
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={
                      selectedRows.size === paginatedReviews.length &&
                      paginatedReviews.length > 0
                    }
                    onChange={toggleAllSelection}
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-sm font-medium">Rating</th>
                <th className="text-left p-4 text-sm font-medium">Review</th>
                <th className="text-left p-4 text-sm font-medium">
                  Registered Date
                </th>
                <th className="text-left p-4 text-sm font-medium">
                  Last Login Date
                </th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Role</th>
                <th className="text-left p-4 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center p-8 text-muted-foreground"
                  >
                    No reviews yet
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedRows.has(review._id)}
                        onChange={() => toggleRowSelection(review._id)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <Link
                          href={`/dashboard/reviews/${review._id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {review.author}
                        </Link>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {review.email || "N/A"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-primary text-primary"
                                : "fill-none text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm max-w-md line-clamp-2">
                        {review.text}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(review.createdAt), "dd MMM, yyyy")}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(review.createdAt), "dd MMM, yyyy")}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={review.verified ? "default" : "secondary"}
                      >
                        {review.verified ? "active" : "invited"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">customer</Badge>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Reply</DropdownMenuItem>
                          <DropdownMenuItem>
                            {review.verified ? "Unverify" : "Verify"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredReviews.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {selectedRows.size} of {filteredReviews.length} row(s) selected.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  const size = Number(value);
                  setPageSize(size);
                  setPage(1);
                  setSelectedRows(new Set());
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <span className="sr-only">Previous page</span>
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  <span className="sr-only">Next page</span>
                  ›
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


