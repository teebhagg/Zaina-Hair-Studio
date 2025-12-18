"use client";

import { useState, useEffect } from "react";
import { columns } from "@/components/appointments/columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type Appointment = {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  price: number;
};

interface AppointmentsClientProps {
  initialData: Appointment[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type FilterType = "current" | "all" | "past";
type DateStatusFilter = "past" | "active" | "future" | "all";

export function AppointmentsClient({
  initialData,
  initialPagination,
}: AppointmentsClientProps) {
  const [data, setData] = useState<Appointment[]>(initialData);
  const [pagination, setPagination] = useState(initialPagination);
  const [filterType, setFilterType] = useState<FilterType>("current"); // Default: current and future
  const [dateStatusFilter, setDateStatusFilter] = useState<DateStatusFilter>("all"); // Default: all statuses
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAppointments = async (page: number, filter: FilterType, statusFilter: DateStatusFilter) => {
    setLoading(true);
    try {
      const includePast = filter === "all";
      const pastOnly = filter === "past";
      const statusParam = statusFilter !== "all" ? `&dateStatus=${statusFilter}` : "";
      const response = await fetch(
        `/api/appointments?page=${page}&limit=10&includePast=${includePast}&pastOnly=${pastOnly}${statusParam}`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setPagination(result.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1, filterType, dateStatusFilter);
    setCurrentPage(1);
  }, [filterType, dateStatusFilter]);

  const handleFilterChange = (filter: FilterType) => {
    setFilterType(filter);
    setCurrentPage(1);
    fetchAppointments(1, filter, dateStatusFilter);
  };

  const handleStatusFilterChange = (status: DateStatusFilter) => {
    setDateStatusFilter(status);
    setCurrentPage(1);
    fetchAppointments(1, filterType, status);
  };

  const handlePageChange = (newPage: number) => {
    fetchAppointments(newPage, filterType, dateStatusFilter);
  };

  return (
    <div className="space-y-4">
      <DataTable 
        data={loading ? [] : data} 
        columns={columns} 
        searchKey="customer" 
        hidePagination={true}
        loading={loading}
        emptyMessage="There are no available appointments."
        filterButtons={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  {filterType === "current" ? "Current & Future" : filterType === "all" ? "All" : "Past Only"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem
                  checked={filterType === "current"}
                  onCheckedChange={() => handleFilterChange("current")}
                >
                  Current & Future
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterType === "all"}
                  onCheckedChange={() => handleFilterChange("all")}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterType === "past"}
                  onCheckedChange={() => handleFilterChange("past")}
                >
                  Past Only
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  {dateStatusFilter === "all" ? "All Status" : dateStatusFilter === "past" ? "Past" : dateStatusFilter === "active" ? "Active" : "Future"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem
                  checked={dateStatusFilter === "all"}
                  onCheckedChange={() => handleStatusFilterChange("all")}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateStatusFilter === "past"}
                  onCheckedChange={() => handleStatusFilterChange("past")}
                >
                  Past
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateStatusFilter === "active"}
                  onCheckedChange={() => handleStatusFilterChange("active")}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateStatusFilter === "future"}
                  onCheckedChange={() => handleStatusFilterChange("future")}
                >
                  Future
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total appointments)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentPage} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

