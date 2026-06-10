const PRODUCTION_APP_URL = "https://app.buxmate.com";

function trimUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/** Client-safe app URL; falls back in dev only. */
export function getPublicAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return trimUrl(configured);
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return PRODUCTION_APP_URL;
}

/** Server-only: requires NEXT_PUBLIC_APP_URL in production. */
export function requirePublicAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (!configured) {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3000";
    }
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }
  return trimUrl(configured);
}

/** Better Auth base URL — BETTER_AUTH_URL or public app URL. */
export function getAuthBaseUrl(): string {
  const authUrl = process.env.BETTER_AUTH_URL;
  if (authUrl) {
    return trimUrl(authUrl);
  }
  return requirePublicAppUrl();
}

const SERVER_ENV_KEYS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "RESEND_API_KEY",
] as const;

/** Validates required server env vars at startup (production only). */
export function validateServerEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = SERVER_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
