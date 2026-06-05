import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

const activityFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Activity name must be at least 2 characters")
    .max(120, "Activity name is too long"),
  description: optionalTrimmedString(2000),
  location: optionalTrimmedString(200),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional().or(z.literal("")),
  cost: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === "") return 0;
      const parsed = typeof value === "number" ? value : Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .pipe(
      z
        .number({ message: "Enter a valid cost" })
        .min(0, "Cost must be zero or greater"),
    ),
});

function endTimeAfterStartRefine<T extends { startTime: string; endTime?: string }>(
  data: T,
) {
  if (!data.endTime) return true;
  return new Date(data.endTime) >= new Date(data.startTime);
}

export const createActivitySchema = activityFieldsSchema.refine(
  endTimeAfterStartRefine,
  {
    message: "End time must be on or after the start time",
    path: ["endTime"],
  },
);

export const updateActivitySchema = createActivitySchema;

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export function parseActivityTimes(input: {
  startTime: string;
  endTime?: string;
}): { startsAt: Date; endsAt: Date | null } {
  return {
    startsAt: new Date(input.startTime),
    endsAt: input.endTime ? new Date(input.endTime) : null,
  };
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function toDateTimeLocalValue(date: Date | null | undefined): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
