import { z } from "zod";

export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
  scheduledDate: z.string().optional().or(z.date().optional()),
  active: z.boolean().default(true),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;
