"use client";

import { createAppointment } from "@/app/[lang]/actions/appointments";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
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
  serviceType?: string; // Service type slug
  extras?: Array<{
    name: string;
    price: number;
    duration?: number | null;
    description?: string | null;
  }>;
}

interface Promotion {
  _id: string;
  title: string;
  slug: { current: string };
  shortText?: string;
  fullDescription?: string;
  features?: string[];
}

interface AppointmentFormProps {
  services: Service[];
  promotions?: Promotion[];
  initialService?: string;
  initialPromotion?: string;
}

// In a real env, this would be an ENV variable
const DASHBOARD_API_URL = "http://localhost:3001/api/availability/public";

export function AppointmentForm({ services, promotions = [], initialService, initialPromotion }: AppointmentFormProps) {
  const { t } = useTranslation();

  // Availability state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { toast } = useToast();

  // Determine initial value - prefer promotion if provided, otherwise use service
  const initialValue = initialPromotion || initialService || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      service: initialValue,
      note: "",
    },
  });

  // Pre-fill service/promotion if provided
  useEffect(() => {
    if (initialValue) {
      setValue("service", initialValue);
    }
  }, [initialValue, setValue]);

  const selectedServiceSlug = watch("service");
  const selectedDate = watch("date");
  const selectedExtras = watch("extras") || [];

  // Check if selected item is a promotion
  const isPromotion = promotions.some(
    (p) => p.slug.current === selectedServiceSlug
  );
  const selectedPromotion = promotions.find(
    (p) => p.slug.current === selectedServiceSlug
  );

  // Fetch availability when Date or Service changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedServiceSlug) {
        setAvailableSlots([]);
        return;
      }

      // If it's a promotion, use default duration (60 minutes)
      if (isPromotion) {
        setLoadingSlots(true);
        try {
          const params = new URLSearchParams({
            date: selectedDate,
            duration: "60", // Default duration for promotions
          });
          const res = await fetch(
            `${DASHBOARD_API_URL}?${params.toString()}`
          );
          if (res.ok) {
            const data = await res.json();
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
        return;
      }

      const service = services.find(
        (s) => s.slug.current === selectedServiceSlug
      );
      if (!service) return;

      setLoadingSlots(true);
      try {
        const params = new URLSearchParams({
          date: selectedDate,
          duration: String(service.duration || 60),
        });
        if (service.serviceType) {
          params.append('serviceType', service.serviceType);
        }
        const res = await fetch(
          `${DASHBOARD_API_URL}?${params.toString()}`
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
  }, [selectedDate, selectedServiceSlug, services, isPromotion]);

  const selectedServiceData = services.find(
    (s) => s.slug.current === selectedServiceSlug
  );

  const basePrice = isPromotion ? 0 : (selectedServiceData?.price ?? 0);
  const baseDuration = isPromotion ? 60 : (selectedServiceData?.duration ?? 0);
  const extrasPrice = Array.isArray(selectedExtras)
    ? selectedExtras.reduce((total: number, extraName: string) => {
        const extra = selectedServiceData?.extras?.find(
          (e) => e.name === extraName
        );
        return total + (extra?.price ?? 0);
      }, 0)
    : 0;
  const totalPrice = basePrice + extrasPrice;

  const extrasDuration = Array.isArray(selectedExtras)
    ? selectedExtras.reduce((total: number, extraName: string) => {
        const extra = selectedServiceData?.extras?.find(
          (e) => e.name === extraName
        );
        return total + (extra?.duration ?? 0);
      }, 0)
    : 0;
  const totalDuration = baseDuration + extrasDuration;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<AppointmentFormData | null>(
    null
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const onSubmit = (data: AppointmentFormData) => {
    // Store data and open confirmation dialog instead of immediately creating
    setPendingData(data);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingData || isConfirming) return;

    setIsConfirming(true);
    try {
      // Check if it's a promotion
      const isPromo = promotions.some(
        (p) => p.slug.current === pendingData.service
      );
      const promotionData = promotions.find(
        (p) => p.slug.current === pendingData.service
      );

      let totalPrice = 0;
      let serviceName = "";

      if (isPromo && promotionData) {
        // For promotions, use promotion title as service name
        serviceName = promotionData.title;
        totalPrice = 0; // Promotions typically have no price or special pricing
      } else {
        // Calculate total price including extras for regular services
        const serviceData = services.find(
          (s) => s.slug.current === pendingData.service
        );
        const basePrice = serviceData?.price ?? 0;
        const extrasPrice = Array.isArray(pendingData.extras)
          ? pendingData.extras.reduce((total: number, extraName: string) => {
              const extra = serviceData?.extras?.find(
                (e) => e.name === extraName
              );
              return total + (extra?.price ?? 0);
            }, 0)
          : 0;
        totalPrice = basePrice + extrasPrice;
        serviceName = serviceData?.name || ""; // Pass service name if available
      }

      const result = await createAppointment({
        ...pendingData,
        price: totalPrice,
        serviceName: serviceName,
      });
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
        setPendingData(null);
        setConfirmOpen(false);
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
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Card className="bg-black text-foreground border-border">
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
                // Reset extras when service changes
                setValue("extras", []);
              }}>
              <SelectTrigger>
                <SelectValue placeholder={t("book.selectService")} />
              </SelectTrigger>
              <SelectContent className="bg-black border-zinc-800 text-white shadow-xl">
                {services.length > 0 ? (
                  <>
                    {services.map((service) => (
                      <SelectItem
                        key={service._id}
                        value={service.slug.current}
                        className="focus:bg-zinc-800 focus:text-white">
                        {service.name}
                        {service.price ? ` - $${service.price}` : ""}
                        {service.duration ? ` (${service.duration} min)` : ""}
                      </SelectItem>
                    ))}
                    {promotions.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs text-muted-foreground border-t border-zinc-800 mt-1">
                          Promotions
                        </div>
                        {promotions.map((promotion) => (
                          <SelectItem
                            key={promotion._id}
                            value={promotion.slug.current}
                            className="focus:bg-zinc-800 focus:text-white">
                            <div className="flex items-center gap-2">
                              <span>{promotion.title}</span>
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 text-xs">
                                Promo
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </>
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
            {(selectedServiceData || selectedPromotion) && (
              <p className="text-sm text-muted-foreground mt-1">
                {isPromotion ? (
                  <>
                    <span className="font-semibold">Promotion: {selectedPromotion?.title}</span>
                    {selectedPromotion?.shortText && (
                      <span className="block text-xs mt-1">
                        {selectedPromotion.shortText}
                      </span>
                    )}
                    <span className="block mt-1">Time: {totalDuration} min</span>
                  </>
                ) : (
                  <>
                    Cost: ${basePrice}
                    {extrasPrice > 0
                      ? ` + $${extrasPrice.toFixed(2)} (extras)`
                      : ""}{" "}
                    • Total: ${totalPrice.toFixed(2)} • Time: {totalDuration} min
                  </>
                )}
              </p>
            )}
          </div>

          {!isPromotion && selectedServiceData?.extras &&
            selectedServiceData.extras.length > 0 && (
              <div>
                <Label>{t("book.extras")}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("book.extrasDescription")}
                </p>
                <div className="space-y-2">
                  {selectedServiceData.extras.map((extra) => {
                    const id = `extra-${extra.name}`;
                    const isChecked = Array.isArray(selectedExtras)
                      ? selectedExtras.includes(extra.name)
                      : false;
                    return (
                      <label
                        key={extra.name}
                        htmlFor={id}
                        className="flex items-start space-x-3 rounded-md border border-zinc-800 px-3 py-2 cursor-pointer hover:bg-zinc-900/60">
                        <Checkbox
                          id={id}
                          className="mt-0.5 rounded-none border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const current = Array.isArray(selectedExtras)
                              ? selectedExtras
                              : [];
                            if (checked) {
                              setValue("extras", [...current, extra.name], {
                                shouldValidate: true,
                              });
                            } else {
                              setValue(
                                "extras",
                                current.filter(
                                  (name: string) => name !== extra.name
                                ),
                                { shouldValidate: true }
                              );
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {extra.name}{" "}
                            {typeof extra.price === "number"
                              ? `+ $${extra.price.toFixed(2)}`
                              : ""}
                          </p>
                          {extra.duration && (
                            <p className="text-xs text-muted-foreground">
                              + {extra.duration} min
                            </p>
                          )}
                          {extra.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {extra.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-black text-foreground border-border">
          <DialogHeader>
            <DialogTitle>
              {t("book.confirmTitle", "Confirm appointment")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">{t("book.service")}:</span>{" "}
              {selectedServiceData?.name || pendingData?.service}
            </p>
            <p>
              <span className="font-medium">{t("book.date")}:</span>{" "}
              {pendingData?.date
                ? format(parseISO(pendingData.date), "PPP")
                : "-"}
            </p>
            <p>
              <span className="font-medium">{t("book.time")}:</span>{" "}
              {pendingData?.time || "-"}
            </p>
            <p>
              <span className="font-medium">Price:</span> $
              {totalPrice.toFixed(2)}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => {
                setConfirmOpen(false);
                setPendingData(null);
              }}>
              {t("common.back")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("book.booking")}
                </>
              ) : (
                t("book.confirmAction", "Confirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
