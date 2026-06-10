export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedPhotoMimeType = (typeof ALLOWED_PHOTO_MIME_TYPES)[number];

export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

export const SIGNED_PHOTO_URL_TTL_SECONDS = 3600;
