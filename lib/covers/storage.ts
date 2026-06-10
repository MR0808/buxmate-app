import {
  createAdminSupabaseClient,
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/supabase";
import { SIGNED_COVER_URL_TTL_SECONDS } from "@/lib/covers/constants";

export function sanitizeCoverFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "cover.jpg";
  const cleaned = base.replace(/[^\w.\-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return cleaned || "cover.jpg";
}

export function buildCoverStoragePath(eventId: string, filename: string): string {
  return `events/${eventId}/cover-${sanitizeCoverFilename(filename)}`;
}

export function isCoverStoragePathForEvent(
  storagePath: string,
  eventId: string,
): boolean {
  return storagePath.startsWith(`events/${eventId}/cover-`);
}

export async function uploadCoverToStorage(
  path: string,
  data: Buffer,
  mimeType: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.eventCovers)
    .upload(path, data, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    return {
      success: false,
      error: "Could not upload cover image. Please try again.",
    };
  }

  return { success: true };
}

export async function deleteCoverFromStorage(path: string) {
  const supabase = createAdminSupabaseClient();
  await supabase.storage.from(STORAGE_BUCKETS.eventCovers).remove([path]);
}

export async function getSignedCoverUrls(
  paths: string[],
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (uniquePaths.length === 0) {
    return new Map();
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.eventCovers as StorageBucket)
    .createSignedUrls(uniquePaths, SIGNED_COVER_URL_TTL_SECONDS);

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

export async function getSignedCoverUrl(path: string): Promise<string | null> {
  const urls = await getSignedCoverUrls([path]);
  return urls.get(path) ?? null;
}
