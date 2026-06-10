import {
  createAdminSupabaseClient,
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/supabase";
import { SIGNED_COVER_URL_TTL_SECONDS } from "@/lib/covers/constants";

export function buildOrganiserAvatarPath(userId: string, filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "avatar.jpg";
  const cleaned = base.replace(/[^\w.\-]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return `organisers/${userId}/avatar-${cleaned || "avatar.jpg"}`;
}

export function isOrganiserAvatarPathForUser(
  storagePath: string,
  userId: string,
): boolean {
  return storagePath.startsWith(`organisers/${userId}/`);
}

export async function uploadOrganiserAvatarToStorage(
  path: string,
  data: Buffer,
  mimeType: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.guestAvatars)
    .upload(path, data, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    return {
      success: false,
      error: "Could not upload avatar. Please try again.",
    };
  }

  return { success: true };
}

export async function deleteOrganiserAvatarFromStorage(path: string) {
  const supabase = createAdminSupabaseClient();
  await supabase.storage.from(STORAGE_BUCKETS.guestAvatars).remove([path]);
}

export async function getSignedAvatarUrl(path: string): Promise<string | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.guestAvatars as StorageBucket)
    .createSignedUrl(path, SIGNED_COVER_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
