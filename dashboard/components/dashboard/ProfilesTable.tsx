"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  appointmentsCount: number;
  reviewsCount: number;
  createdAt?: string;
}

interface ProfilesTableProps {
  customers: CustomerItem[];
}

export function ProfilesTable({ customers }: ProfilesTableProps) {
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

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
      selectedRows.size === paginatedCustomers.length &&
      paginatedCustomers.length > 0
    ) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedCustomers.map((c) => c._id)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer Profiles</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              A list of all customers created from appointments and reviews.
            </p>
          </div>
          {customers.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Total customers: {customers.length}
            </div>
          )}
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
                      selectedRows.size === paginatedCustomers.length &&
                      paginatedCustomers.length > 0
                    }
                    onChange={toggleAllSelection}
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-sm font-medium">Phone</th>
                <th className="text-left p-4 text-sm font-medium">
                  Appointments
                </th>
                <th className="text-left p-4 text-sm font-medium">Reviews</th>
                <th className="text-left p-4 text-sm font-medium">Joined</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center p-8 text-muted-foreground"
                  >
                    No customer profiles yet
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedRows.has(customer._id)}
                        onChange={() => toggleRowSelection(customer._id)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID #{customer._id.slice(-6)}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer.phone}
                    </td>
                    <td className="p-4 text-sm">
                      {customer.appointmentsCount}
                    </td>
                    <td className="p-4 text-sm">{customer.reviewsCount}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer.createdAt
                        ? format(new Date(customer.createdAt), "dd MMM, yyyy")
                        : "—"}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">active</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {customers.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {selectedRows.size} of {customers.length} row(s) selected.
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


