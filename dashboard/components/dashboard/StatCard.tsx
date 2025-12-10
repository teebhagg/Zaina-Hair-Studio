"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUpRight, MoreVertical, Receipt, ShoppingBag, Users, ArrowDown, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  receipt: Receipt,
  shoppingBag: ShoppingBag,
  users: Users,
  arrowDown: ArrowDown,
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType?: "positive" | "negative";
  todayChange: string;
  icon: keyof typeof iconMap;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "positive",
  todayChange,
  icon,
  iconColor = "bg-purple-500",
}: StatCardProps) {
  const Icon = iconMap[icon] || Receipt;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconColor}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Export data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`flex items-center gap-1 font-medium ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}
          >
            <ArrowUpRight
              className={`h-4 w-4 ${
                changeType === "negative" ? "rotate-180" : ""
              }`}
            />
            {change}
          </span>
          <span className="text-muted-foreground">{todayChange}</span>
        </div>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View Report
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

