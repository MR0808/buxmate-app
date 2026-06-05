import { z } from "zod";

export const EVENT_TYPES = [
  "Bucks party",
  "Hens party",
  "Group weekend",
  "Birthday weekend",
  "Other",
] as const;

export const EDITABLE_EVENT_STATUSES = ["DRAFT", "ACTIVE"] as const;

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

const eventFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Event name must be at least 2 characters")
    .max(120, "Event name is too long"),
  eventType: z.enum(EVENT_TYPES, {
    message: "Choose an event type",
  }),
  location: optionalTrimmedString(200),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  description: optionalTrimmedString(2000),
});

function endDateAfterStartRefine<T extends { startDate: string; endDate?: string }>(
  data: T,
) {
  if (!data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}

export const createEventSchema = eventFieldsSchema.refine(endDateAfterStartRefine, {
  message: "End date must be on or after the start date",
  path: ["endDate"],
});

export const updateEventSchema = eventFieldsSchema
  .extend({
    status: z.enum(EDITABLE_EVENT_STATUSES, {
      message: "Choose a valid status",
    }),
  })
  .refine(endDateAfterStartRefine, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export function slugifyEventName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function parseEventDates(input: {
  startDate: string;
  endDate?: string;
}): { startsAt: Date; endsAt: Date | null } {
  return {
    startsAt: new Date(`${input.startDate}T12:00:00`),
    endsAt: input.endDate
      ? new Date(`${input.endDate}T12:00:00`)
      : null,
  };
}
