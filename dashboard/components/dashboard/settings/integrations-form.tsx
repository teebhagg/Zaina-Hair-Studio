"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function IntegrationsForm() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for success/error params from OAuth redirect
    const success = searchParams.get("success")
    if (success === "google_connected") {
        // Remove params for cleaner URL
        window.history.replaceState({}, "", "/dashboard/settings?tab=integrations")
        // Could show a toast here
    }

    // Fetch integration status
    async function checkStatus() {
      try {
        const response = await fetch("/api/settings/availability")
        if (response.ok) {
           const data = await response.json()
           setIsConnected(data.isGoogleConnected)
        }
      } catch (e) {
        console.error("Failed to check status", e)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [searchParams])

  const handleConnect = async () => {
    setIsLoading(true)
    // Redirect to Google OAuth endpoint
    window.location.href = "/api/auth/google"
  }

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) return

    setIsLoading(true)
    try {
        const response = await fetch("/api/auth/google/disconnect", { method: "POST" })
        if (response.ok) {
            setIsConnected(false)
        }
    } catch (e) {
        console.error("Failed to disconnect", e)
        alert("Failed to disconnect")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base">Google Calendar</CardTitle>
            <CardDescription>
              Sync your appointments with your Google Calendar.
            </CardDescription>
          </div>
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardFooter className="border-t px-6 py-4">
          {isLoading ? (
            <Button disabled>Loading...</Button>
          ) : isConnected ? (
             <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Connected</span>
                </div>
                <Button variant="outline" onClick={handleDisconnect} disabled={isLoading}>
                    Disconnect
                </Button>
             </div>
          ) : (
            <Button onClick={handleConnect} disabled={isLoading}>
                Connect Google Calendar
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
