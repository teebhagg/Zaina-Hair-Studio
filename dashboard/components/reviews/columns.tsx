"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, MessageSquare, Trash2, Star } from "lucide-react"

export type Review = {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  status: "published" | "pending" | "rejected"
}

interface ColumnsProps {
  onView?: (reviewId: string) => void
  onDelete?: (reviewId: string) => void
}

export const createColumns = ({ onView, onDelete }: ColumnsProps): ColumnDef<Review>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => {
      return (
        <div className="min-w-[120px]">
          {row.getValue("name")}
        </div>
      )
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="min-w-[140px]"
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number
      return (
        <div className="flex items-center justify-center ">
          <div className="hidden md:flex items-center justify-content-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="flex md:hidden items-center">
            {rating}
            <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string
      return (
        <div className="max-w-[180px] md:max-w-[360px] truncate" title={comment}>
          {comment}
        </div>
      )
    },
    enableHiding: true,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string
      return (
        <div className="whitespace-nowrap min-w-[80px]">
          {date}
        </div>
      )
    },
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const review = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(review.id)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                View & Reply
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(review.id)}
            >
              Copy review ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(review.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Default export for backward compatibility
export const columns: ColumnDef<Review>[] = createColumns({})
