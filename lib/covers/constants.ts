export const ALLOWED_COVER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedCoverMimeType = (typeof ALLOWED_COVER_MIME_TYPES)[number];

export const MAX_COVER_BYTES = 10 * 1024 * 1024;

export const SIGNED_COVER_URL_TTL_SECONDS = 3600;
