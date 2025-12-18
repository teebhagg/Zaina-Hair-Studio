"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

export function SyncAllButton() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncAllAppointments = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/appointments/sync-all", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        const results = data.results || {};
        const summary = results.deleted
          ? `${data.message} (${results.created} created, ${results.updated} updated, ${results.deleted} deleted)`
          : data.message || "All appointments synced with Google Calendar";
        
        toast({
          title: "Success",
          description: summary,
        });
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to sync appointments with Google Calendar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error syncing all appointments:", error);
      toast({
        title: "Error",
        description: "Failed to sync appointments with Google Calendar",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={syncAllAppointments}
      disabled={syncing}
      variant="outline"
      className="h-10 px-4 rounded-lg font-semibold border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all flex items-center gap-2">
      {syncing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <RefreshCw className="h-4 w-4" />
          Sync All Appointments
        </>
      )}
    </Button>
  );
}

