import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

export const guestFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  email: optionalTrimmedString(254).refine(
    (value) => !value || z.email().safeParse(value).success,
    { message: "Enter a valid email address" },
  ),
  phone: optionalTrimmedString(40),
});

export const createGuestSchema = guestFieldsSchema;
export const updateGuestSchema = guestFieldsSchema;

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
