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
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export type Appointment = {
  id: string
  customer: string
  service: string
  date: string
  readableDate?: string
  time: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  dateStatus?: "past" | "active" | "future"
  price: number
}

export const columns: ColumnDef<Appointment>[] = [
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
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => {
      const appointment = row.original
      const dateStr = appointment.readableDate || appointment.date
      const dateObj = appointment.date ? new Date(appointment.date) : null
      const formattedDate = dateObj 
        ? format(dateObj, "EEE, MMM dd, yyyy")
        : dateStr
      
      return (
        <div>
          <div className="font-medium">{formattedDate}</div>
          <div className="text-sm text-muted-foreground">at {appointment.time}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "dateStatus",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original
      const dateStatus = appointment.dateStatus || "future"
      let variant: "default" | "secondary" | "destructive" | "outline" = "default"
      let label = ""
      
      switch (dateStatus) {
        case "past":
          variant = "destructive"
          label = "Past"
          break
        case "active":
          variant = "default"
          label = "Active"
          // Use green color for active
          break
        case "future":
          variant = "outline"
          label = "Future"
          // Use blue color for future
          break
      }

      return (
        <Badge 
          variant={variant} 
          className={cn(
            "capitalize",
            dateStatus === "active" && "bg-green-500/20 text-green-400 border-green-500/30",
            dateStatus === "future" && "bg-blue-500/20 text-blue-400 border-blue-500/30"
          )}
        >
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(appointment.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Confirm</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
