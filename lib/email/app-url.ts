export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }
  return url.replace(/\/$/, "");
}

export function getAuthApiUrl(): string {
  const base =
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? getAppUrl();
  return `${base}/api/auth`;
}
