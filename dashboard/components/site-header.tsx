"use client";

import {
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface SiteHeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function SiteHeader({
  isSidebarCollapsed,
  onToggleSidebar,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "admin@salon.com";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label =
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      return { href, label };
    });
    return breadcrumbs;
  };

  // Page title from pathname
  const generatePageTitle = () => {
    const paths = pathname.split("/").filter(Boolean);
    const pageTitle = paths.map(
      (path) => path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")
    );
    return pageTitle;
  };

  const pageTitle = generatePageTitle();

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg border border-border/50 bg-background hover:bg-accent hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={onToggleSidebar}>
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* Page Title */}
          <h1 className="text-lg font-semibold">
            {pageTitle[pageTitle.length - 1]}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/01.png" alt={userName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex w-full cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
