import { z } from "zod";

export const updateProfileNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().trim().email("Enter a valid email address"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const notificationPreferencesSchema = z.object({
  notifyRsvpUpdates: z.boolean(),
  notifyGuestJoins: z.boolean(),
  notifyPaymentUpdates: z.boolean(),
});

export const duplicateEventSchema = z.object({
  copyAnnouncements: z.boolean().default(false),
});

export type UpdateProfileNameInput = z.infer<typeof updateProfileNameSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
export type DuplicateEventInput = z.infer<typeof duplicateEventSchema>;
