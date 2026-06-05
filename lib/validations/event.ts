import { z } from "zod";

export const EVENT_TYPES = [
  "Bucks party",
  "Hens party",
  "Group weekend",
  "Birthday weekend",
  "Other",
] as const;

export const createEventSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Event name must be at least 2 characters")
      .max(120, "Event name is too long"),
    eventType: z.enum(EVENT_TYPES, {
      message: "Choose an event type",
    }),
    location: z
      .string()
      .trim()
      .max(200, "Location is too long")
      .optional()
      .or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(2000, "Description is too long")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be on or after the start date",
      path: ["endDate"],
    },
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;

export function slugifyEventName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
