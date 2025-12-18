"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeft,
  Menu,
  Search,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-provider";

const topNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profiles", label: "Customers" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/profile", label: "Settings" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, setIsOpen, isMobile } = useSidebar();

  const name = session?.user?.name ?? "Admin";
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      {/* Left side - sidebar toggles */}
      <div className="flex items-center gap-2">
        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-9 w-9 rounded-lg border border-border/50 bg-background hover:bg-accent hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Separator */}
        <div className="hidden md:block h-6 w-px bg-border" />

        {/* Mobile sidebar sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-lg border border-border/50 bg-background hover:bg-accent hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar isCollapsed={!isOpen} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1">
        {topNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:flex">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 h-9 bg-muted/40 border-border"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Mobile search */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Light</DropdownMenuItem>
            <DropdownMenuItem>Dark</DropdownMenuItem>
            <DropdownMenuItem>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profile">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>

        {/* User avatar */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 bg-primary/10"
        >
          <span className="text-xs font-semibold">{initials}</span>
        </Button>
      </div>
    </header>
  );
}

