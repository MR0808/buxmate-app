import { z } from "zod";

export const ALLOCATION_MODES = [
  "EQUAL_ALL_GUESTS",
  "EQUAL_ACTIVITY_GOING",
] as const;

export type AllocationMode = (typeof ALLOCATION_MODES)[number];

export const createPaymentItemSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(120, "Title is too long"),
    description: z
      .string()
      .trim()
      .max(500, "Description is too long")
      .optional()
      .or(z.literal("")),
    amount: z
      .union([z.string(), z.number()])
      .transform((value) => {
        const parsed = typeof value === "number" ? value : Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : Number.NaN;
      })
      .pipe(z.number({ message: "Enter a valid amount" }).positive("Amount must be greater than 0")),
    activityId: z.string().optional().or(z.literal("")),
    allocationMode: z.enum(ALLOCATION_MODES, {
      message: "Choose how to split this payment",
    }),
  })
  .refine(
    (data) =>
      data.allocationMode !== "EQUAL_ACTIVITY_GOING" || Boolean(data.activityId),
    {
      message: "Select an activity to split among guests who are going",
      path: ["activityId"],
    },
  );

export const updatePaymentItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
});

export type CreatePaymentItemInput = z.infer<typeof createPaymentItemSchema>;
export type UpdatePaymentItemInput = z.infer<typeof updatePaymentItemSchema>;
