import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKETS = {
  eventCovers: "event-covers",
  guestAvatars: "guest-avatars",
  eventPhotos: "event-photos",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

function getPublishableKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  return key;
}

function getSecretKey() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SECRET_KEY");
  }
  return key;
}

export function createBrowserSupabaseClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getPublishableKey());
}

export function createServerSupabaseClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getPublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAdminSupabaseClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getSignedStorageUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
