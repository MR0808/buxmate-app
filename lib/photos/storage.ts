import {
  createAdminSupabaseClient,
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/supabase";

export function sanitizePhotoFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "photo.jpg";
  const cleaned = base.replace(/[^\w.\-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return cleaned || "photo.jpg";
}

export function buildPhotoStoragePath(
  eventId: string,
  photoId: string,
  filename: string,
): string {
  return `events/${eventId}/photos/${photoId}-${sanitizePhotoFilename(filename)}`;
}

export function isPhotoStoragePathForEvent(
  storagePath: string,
  eventId: string,
): boolean {
  return storagePath.startsWith(`events/${eventId}/photos/`);
}

export async function uploadPhotoToStorage(
  path: string,
  data: Buffer,
  mimeType: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.eventPhotos)
    .upload(path, data, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    return {
      success: false,
      error: "Could not upload photo. Please try again.",
    };
  }

  return { success: true };
}

export async function deletePhotoFromStorage(path: string) {
  const supabase = createAdminSupabaseClient();
  await supabase.storage.from(STORAGE_BUCKETS.eventPhotos).remove([path]);
}

export async function getSignedPhotoUrls(
  paths: string[],
): Promise<Map<string, string>> {
  if (paths.length === 0) {
    return new Map();
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.eventPhotos as StorageBucket)
    .createSignedUrls(paths, 3600);

  if (error || !data) {
    return new Map();
  }

  const urls = new Map<string, string>();
  for (const item of data) {
    if (item.path && item.signedUrl) {
      urls.set(item.path, item.signedUrl);
    }
  }

  return urls;
}
