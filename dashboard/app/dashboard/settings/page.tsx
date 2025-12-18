import { AvailabilityForm } from "@/components/dashboard/settings/availability-form"
import { IntegrationsForm } from "@/components/dashboard/settings/integrations-form"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your availability and integrations.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
             {/* Navigation items could go here if using sub-routes, but we are using Tabs for simplicity */}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Tabs defaultValue="availability" className="space-y-6">
            <TabsList>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            <TabsContent value="availability">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Work Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your weekly availability for appointments.
                  </p>
                </div>
                <Separator />
                <AvailabilityForm />
              </div>
            </TabsContent>
            <TabsContent value="integrations">
              <div className="space-y-6">
                 <div>
                  <h3 className="text-lg font-medium">Integrations</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect external services to your dashboard.
                  </p>
                </div>
                <Separator />
                <IntegrationsForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
