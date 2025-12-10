"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-provider";
import { cn } from "@/lib/utils";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile, shown on desktop */}
      {!isMobile && isOpen && (
        <div className="hidden md:block">
          <Sidebar className="fixed inset-y-0 left-0 z-40" />
        </div>
      )}

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          !isMobile && isOpen && "md:pl-64"
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
