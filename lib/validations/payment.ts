import { z } from "zod";

export const PAYMENT_COST_SCOPES = ["ACTIVITY", "EVENT_WIDE"] as const;
export type PaymentCostScopeInput = (typeof PAYMENT_COST_SCOPES)[number];

export const ALLOCATION_METHODS = [
  "ALL_ACTIVE_GUESTS",
  "ALL_ACTIVE_GUESTS_EXCLUDING_GUEST_OF_HONOUR",
  "ACTIVITY_GOING_GUESTS",
] as const;

export type AllocationMethod = (typeof ALLOCATION_METHODS)[number];

/** @deprecated Use AllocationMethod */
export const ALLOCATION_MODES = ALLOCATION_METHODS;
/** @deprecated Use AllocationMethod */
export type AllocationMode = AllocationMethod;

const amountField = z
  .union([z.string(), z.number()])
  .transform((value) => {
    const parsed = typeof value === "number" ? value : Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .pipe(
    z
      .number({ message: "Enter a valid amount" })
      .positive("Amount must be greater than 0"),
  );

const paymentItemBaseSchema = z.object({
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
  amount: amountField,
  costScope: z.enum(PAYMENT_COST_SCOPES, {
    message: "Choose a cost scope",
  }),
  activityId: z.string().optional().or(z.literal("")),
  allocationMethod: z.enum(ALLOCATION_METHODS, {
    message: "Choose how to split this payment",
  }),
  excludeGuestOfHonour: z.boolean().optional().default(false),
});

export const createPaymentItemSchema = paymentItemBaseSchema
  .refine(
    (data) =>
      data.costScope !== "ACTIVITY" || Boolean(data.activityId),
    {
      message: "Select an activity for activity-scoped costs",
      path: ["activityId"],
    },
  )
  .refine(
    (data) =>
      data.allocationMethod !== "ACTIVITY_GOING_GUESTS" ||
      Boolean(data.activityId),
    {
      message: "Select an activity to split among guests who are going",
      path: ["activityId"],
    },
  );

export const paymentPreviewSchema = createPaymentItemSchema;

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

export const overrideAllocationSchema = z.object({
  amountOwed: amountField,
  overrideReason: z
    .string()
    .trim()
    .max(300, "Reason is too long")
    .optional()
    .or(z.literal("")),
});

export type CreatePaymentItemInput = z.infer<typeof createPaymentItemSchema>;
export type UpdatePaymentItemInput = z.infer<typeof updatePaymentItemSchema>;
export type OverrideAllocationInput = z.infer<typeof overrideAllocationSchema>;
