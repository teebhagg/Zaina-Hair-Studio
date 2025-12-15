"use client";

import { createAppointment } from "@/app/[lang]/actions/appointments";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  appointmentSchema,
  type AppointmentFormData,
} from "@/lib/validators/appointment";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface Service {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  duration: number; // in minutes
}

interface AppointmentFormProps {
  services: Service[];
}

// In a real env, this would be an ENV variable
const DASHBOARD_API_URL = "http://localhost:3001/api/availability/public";

export function AppointmentForm({ services }: AppointmentFormProps) {
  const { t } = useTranslation();

  // Availability state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const selectedServiceSlug = watch("service");
  const selectedDate = watch("date");

  // Fetch availability when Date or Service changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedServiceSlug) {
        setAvailableSlots([]);
        return;
      }

      const service = services.find(
        (s) => s.slug.current === selectedServiceSlug
      );
      if (!service) return;

      setLoadingSlots(true);
      try {
        const res = await fetch(
          `${DASHBOARD_API_URL}?date=${selectedDate}&duration=${service.duration || 60}`
        );
        if (res.ok) {
          const data = await res.json();
          console.log(data);
          setAvailableSlots(data.slots || []);
        } else {
          console.error("Availability fetch failed");
          setAvailableSlots([]);
        }
      } catch (e) {
        console.error("Availability error", e);
      } finally {
        setLoadingSlots(false);
      }
    }

    const timer = setTimeout(() => {
      fetchAvailability();
    }, 500); // Debounce slightly

    return () => clearTimeout(timer);
  }, [selectedDate, selectedServiceSlug, services]);

  const selectedServiceData = services.find(
    (s) => s.slug.current === selectedServiceSlug
  );

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const result = await createAppointment(data);
      if (result.success) {
        toast({
          title: t("book.success"),
          description: t("book.successDescription"),
        });
        // Reset form to default values
        reset({
          name: "",
          email: "",
          phone: "",
          service: "",
          date: "",
          time: "",
          note: "",
        });
        // Clear service selection and available slots
        setValue("service", "");
        setValue("date", "");
        setValue("time", "");
        setAvailableSlots([]);
      } else {
        toast({
          title: t("book.error"),
          description: result.error || t("book.errorDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("book.error"),
        description: t("book.errorDescription"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("book.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("book.name")}</Label>
            <Input id="name" {...register("name")} placeholder="John Doe" />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">{t("book.email")}</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">{t("book.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="(555) 123-4567"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="service">{t("book.service")}</Label>
            <Select
              value={selectedServiceSlug || ""}
              onValueChange={(value) => {
                setValue("service", value);
                // Reset time when service changes as duration affects slots
                setValue("time", "");
              }}>
              <SelectTrigger>
                <SelectValue placeholder={t("book.selectService")} />
              </SelectTrigger>
              <SelectContent className="bg-black border-zinc-800 text-white shadow-xl">
                {services.length > 0 ? (
                  services.map((service) => (
                    <SelectItem
                      key={service._id}
                      value={service.slug.current}
                      className="focus:bg-zinc-800 focus:text-white">
                      {service.name}
                      {service.price ? ` - $${service.price}` : ""}
                      {service.duration ? ` (${service.duration} min)` : ""}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="no-services"
                    disabled
                    className="text-muted-foreground">
                    No services found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.service && (
              <p className="text-sm text-destructive mt-1">
                {errors.service.message}
              </p>
            )}
            {selectedServiceData && (
              <p className="text-sm text-muted-foreground mt-1">
                Cost: ${selectedServiceData.price} • Duration:{" "}
                {selectedServiceData.duration} min
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="date">{t("book.date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={!selectedServiceSlug}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(parseISO(selectedDate), "PPP")
                    ) : (
                      <span>{t("book.date")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-black border-zinc-800 text-white"
                  align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? parseISO(selectedDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Format as YYYY-MM-DD
                        const offsetDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        );
                        const dateString = offsetDate
                          .toISOString()
                          .split("T")[0];
                        setValue("date", dateString);
                        setValue("time", ""); // Reset time
                      }
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                    className="bg-black text-white"
                  />
                </PopoverContent>
              </Popover>

              <input type="hidden" {...register("date")} />

              {errors.date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="time">{t("book.time")}</Label>
              {/* Replaced Input type="time" with Select for available slots */}
              <Select
                value={watch("time") || ""}
                onValueChange={(value) => setValue("time", value)}
                disabled={
                  !selectedDate || loadingSlots || availableSlots.length === 0
                }>
                <SelectTrigger id="time">
                  <SelectValue
                    placeholder={loadingSlots ? "Loading..." : t("book.time")}
                  />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white shadow-xl">
                  {availableSlots.map((slot) => (
                    <SelectItem
                      key={slot}
                      value={slot}
                      className="focus:bg-zinc-800 focus:text-white">
                      {slot}
                    </SelectItem>
                  ))}
                  {availableSlots.length === 0 &&
                    !loadingSlots &&
                    selectedDate && (
                      <SelectItem
                        value="none"
                        disabled
                        className="text-muted-foreground">
                        No slots available
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
              {/* Hidden input to register time for React Hook Form validation if needed, or rely on setValue */}
              {/* Ensure react-hook-form knows about the value update, handled by onValueChange above */}
              <input type="hidden" {...register("time")} />
              {errors.time && (
                <p className="text-sm text-destructive mt-1">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="note">
              {t("book.notes")} ({t("book.optional")})
            </Label>
            <Textarea
              id="note"
              {...register("note")}
              placeholder={t("book.notesPlaceholder")}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? t("book.booking") : t("book.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
