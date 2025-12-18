"use client";

import * as React from "react";

import { Sidebar as DashboardSidebar } from "@/components/layout/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const hasInitializedDesktop = React.useRef(false);

  // Default behavior:
  // - On first load on mobile: sidebar closed
  // - On first load on desktop: sidebar open
  React.useEffect(() => {
    if (!isMobile && !hasInitializedDesktop.current) {
      setIsSidebarOpen(true);
      hasInitializedDesktop.current = true;
    }
  }, [isMobile]);

  return (
    <>
      {/* Mobile: sidebar as sheet / drawer */}
      <Sheet open={isMobile && isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent
          side="left"
          className="w-64 border-r bg-background p-0 md:hidden">
          <DashboardSidebar isCollapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Desktop: fixed sidebar + shifted content */}
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:block">
          <div className="fixed inset-y-0 left-0 z-30">
            <DashboardSidebar isCollapsed={!isSidebarOpen} />
          </div>
        </div>
        <div
          className={cn(
            "flex flex-1 flex-col transition-[margin-left] duration-300",
            !isSidebarOpen ? "md:ml-16" : "md:ml-64",
            "ml-0"
          )}>
          <SiteHeader
            isSidebarCollapsed={!isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prevOpen) => !prevOpen)}
          />
          <main className="flex-1 p-4">
            <div className="flex flex-1 flex-col gap-4 md:gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
