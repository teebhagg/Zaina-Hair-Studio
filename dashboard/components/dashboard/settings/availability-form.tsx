"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
// import { toast } from "@/components/ui/use-toast" // We'll add this later if needed

const availabilityFormSchema = z.object({
  workDays: z.array(
    z.object({
      day: z.string(),
      isOpen: z.boolean().default(true),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
})

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>

const defaultValues: AvailabilityFormValues = {
  workDays: [
    { day: "Monday", isOpen: true, startTime: "09:00", endTime: "17:00" },
    { day: "Tuesday", isOpen: true, startTime: "09:00", endTime: "17:00" },
    { day: "Wednesday", isOpen: true, startTime: "09:00", endTime: "17:00" },
    { day: "Thursday", isOpen: true, startTime: "09:00", endTime: "17:00" },
    { day: "Friday", isOpen: true, startTime: "09:00", endTime: "17:00" },
    { day: "Saturday", isOpen: true, startTime: "10:00", endTime: "15:00" },
    { day: "Sunday", isOpen: false, startTime: "09:00", endTime: "17:00" },
  ],
}

export function AvailabilityForm() {
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues,
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "workDays",
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/availability")
        if (response.ok) {
          const data = await response.json()
          if (data.workDays && data.workDays.length > 0) {
            // Merge fetched days with default structure to ensure all days exist
            // (Simplification: assuming API returns correct structure or we just use it)
            // Ideally we'd map over defaultValues and merge API data
            
            // For now, if API has data, use it. If keys are missing, defaults might be needed.
            // Let's assume API returns full array as saved.
             form.reset({
                 workDays: data.workDays
             })
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings", error)
        toast.error("Failed to load availability settings")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [form])

  async function onSubmit(data: AvailabilityFormValues) {
    setIsSaving(true)
    try {
        const response = await fetch("/api/settings/availability", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error("Failed to save settings")
        }

        toast.success("Availability saved successfully")
    } catch (error) {
        console.error(error)
        toast.error("Failed to save availability")
    } finally {
        setIsSaving(false)
    }
  }

  if (loading) {
      return (
        <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center space-x-4 rounded-lg border p-4"
          >
            <div className="w-[100px] font-medium">{field.day}</div>
            <FormField
              control={form.control}
              name={`workDays.${index}.isOpen`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {field.value ? "Open" : "Closed"}
                  </FormLabel>
                </FormItem>
              )}
            />
            {form.watch(`workDays.${index}.isOpen`) && (
              <>
                 <FormField
                  control={form.control}
                  name={`workDays.${index}.startTime`}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input {...field} type="time" className="w-[110px]" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span className="text-sm text-muted-foreground">-</span>
                 <FormField
                  control={form.control}
                  name={`workDays.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input {...field} type="time" className="w-[110px]" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        ))}
        <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Availability
        </Button>
      </form>
    </Form>
  )
}

