'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Appointment {
  _id: string
  name: string
  email: string
  phone: string
  service: string
  serviceName?: string
  date: string
  time: string
  status: 'pending' | 'approved' | 'completed' | 'cancelled'
  note?: string
  createdAt: string
}

interface AppointmentTableProps {
  appointments: Appointment[]
  onStatusChange?: (id: string, status: string) => void
}

export function AppointmentTable({
  appointments,
  onStatusChange,
}: AppointmentTableProps) {
  const [filter, setFilter] = useState<string>('all')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [pageSize, setPageSize] = useState<number>(10)
  const [page, setPage] = useState<number>(1)

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedAppointments.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedAppointments.map((apt) => apt._id)))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Appointments</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedRows.size > 0 ? `${selectedRows.size} of ${filteredAppointments.length} row(s) selected.` : 'Manage customer appointments'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    checked={selectedRows.size === filteredAppointments.length && filteredAppointments.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-sm font-medium">Phone Number</th>
                <th className="text-left p-4 text-sm font-medium">Service</th>
                <th className="text-left p-4 text-sm font-medium">Date</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    No appointments found
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
                  <tr key={apt._id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(apt._id)}
                        onChange={() => toggleRowSelection(apt._id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <Link href={`/dashboard/appointments/${apt._id}`} className="font-medium hover:text-primary transition-colors">
                          {apt.name}
                        </Link>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{apt.email}</td>
                    <td className="p-4 text-sm text-muted-foreground">{apt.phone}</td>
                    <td className="p-4">{apt.serviceName || apt.service}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(apt.date), 'dd MMM, yyyy')}
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
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
                          <DropdownMenuItem
                            onClick={() => onStatusChange?.(apt._id, 'approved')}
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onStatusChange?.(apt._id, 'completed')}
                          >
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onStatusChange?.(apt._id, 'cancelled')}
                            className="text-destructive"
                          >
                            Cancel
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
        {filteredAppointments.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {selectedRows.size} of {filteredAppointments.length} row(s) selected.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  const size = Number(value)
                  setPageSize(size)
                  setPage(1)
                  setSelectedRows(new Set())
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
  )
}
