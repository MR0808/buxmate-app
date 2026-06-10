import { z } from "zod";
import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_BYTES,
  type AllowedPhotoMimeType,
} from "@/lib/photos/constants";

export const photoCaptionSchema = z
  .string()
  .trim()
  .max(300, "Caption is too long")
  .optional()
  .or(z.literal(""));

export type PhotoCaptionInput = z.infer<typeof photoCaptionSchema>;

export function parsePhotoCaption(
  value: FormDataEntryValue | null,
):
  | { success: true; caption: string | null }
  | { success: false; error: string } {
  if (value === null || value === "") {
    return { success: true, caption: null };
  }

  if (typeof value !== "string") {
    return { success: false, error: "Invalid caption." };
  }

  const parsed = photoCaptionSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid caption.",
    };
  }

  const caption = parsed.data?.trim();
  return { success: true, caption: caption ? caption : null };
}

export function validatePhotoFile(
  file: File,
): { success: true; mimeType: AllowedPhotoMimeType } | { success: false; error: string } {
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose a photo to upload." };
  }

  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type as AllowedPhotoMimeType)) {
    return {
      success: false,
      error: "Only JPEG, PNG and WebP images are allowed.",
    };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return { success: false, error: "Image must be 20 MB or smaller." };
  }

  return { success: true, mimeType: file.type as AllowedPhotoMimeType };
}
