"use client";

import { Calendar, LayoutDashboard, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Nav, type NavItem } from "./nav";

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
  },
];

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
}

export function Sidebar({ className, isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-gradient-to-b from-background via-muted/40 to-background/80 shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}>
      {/* Logo / brand */}
      <div className="flex h-16 items-center border-b border-border/70 px-4 backdrop-blur-sm">
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/90 text-primary-foreground shadow-sm">
              Z
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-tight">
                Zaina&apos;s Salon
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Admin dashboard
              </span>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/90 text-primary-foreground shadow-sm">
              Z
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <div className="px-2">
          {!isCollapsed && <Nav items={navItems} pathname={pathname} />}
          {isCollapsed && (
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = item.href === pathname;
                return (
                  <Button
                    key={index}
                    variant={isActive ? "secondary" : "ghost"}
                    size="icon"
                    className={cn("w-full", isActive && "bg-muted")}
                    asChild>
                    <Link href={item.href || "#"}>
                      {Icon && <Icon className="h-4 w-4" />}
                    </Link>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/70 bg-background/60 p-3 backdrop-blur-sm">
        {!isCollapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted"
            asChild>
            <Link href="/api/auth/signout">
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Sign Out
            </Link>
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full rounded-xl"
            asChild>
            <Link href="/api/auth/signout">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
