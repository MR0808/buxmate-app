import {
  ALLOWED_COVER_MIME_TYPES,
  MAX_COVER_BYTES,
  type AllowedCoverMimeType,
} from "@/lib/covers/constants";

export function validateCoverFile(
  file: File,
):
  | { success: true; mimeType: AllowedCoverMimeType }
  | { success: false; error: string } {
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose an image to upload." };
  }

  if (!ALLOWED_COVER_MIME_TYPES.includes(file.type as AllowedCoverMimeType)) {
    return {
      success: false,
      error: "Only JPEG, PNG and WebP images are allowed.",
    };
  }

  if (file.size > MAX_COVER_BYTES) {
    return { success: false, error: "Image must be 10 MB or smaller." };
  }

  return { success: true, mimeType: file.type as AllowedCoverMimeType };
}
