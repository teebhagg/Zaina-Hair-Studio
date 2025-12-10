"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ActivityRow {
  user: string;
  status: "Invited" | "New" | "Suspended";
  id: string;
  date: string;
  amount: string;
}

const recentActivities: ActivityRow[] = [
  {
    user: "Preciousprecious_durgan38@hotmail.com",
    status: "Invited",
    id: "#329341",
    date: "02 min ago",
    amount: "$286.36",
  },
  {
    user: "Eugeniaeugenia4@gmail.com",
    status: "New",
    id: "#329341",
    date: "14 min ago",
    amount: "$967.02",
  },
  {
    user: "Mackenziemackenzie.mcclure@hotmail.com",
    status: "Invited",
    id: "#329341",
    date: "50 min ago",
    amount: "$223.58",
  },
  {
    user: "Nedned_moore@hotmail.com",
    status: "Suspended",
    id: "#329341",
    date: "43 min ago",
    amount: "$891.14",
  },
  {
    user: "Joshuajoshua27@hotmail.com",
    status: "Invited",
    id: "#329341",
    date: "37 min ago",
    amount: "$524.43",
  },
];

const getStatusBadgeVariant = (status: ActivityRow["status"]) => {
  switch (status) {
    case "New":
      return "default";
    case "Invited":
      return "secondary";
    case "Suspended":
      return "destructive";
    default:
      return "secondary";
  }
};

export function RecentActivityTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          A list of your recent activity.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivities.map((activity, index) => {
              const initials = activity.user
                .split("@")[0]
                .substring(0, 2)
                .toUpperCase();
              const displayName = `${initials}${activity.user}`;
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                        {initials}
                      </div>
                      <span className="max-w-[250px] truncate text-sm">
                        {displayName}
                      </span>
                    </div>
                  </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(activity.status)}>
                    {activity.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.id}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.date}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {activity.amount}
                </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

