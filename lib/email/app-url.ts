import { getAuthBaseUrl, requirePublicAppUrl } from "@/lib/env";

export function getAppUrl(): string {
  return requirePublicAppUrl();
}

export function getAuthApiUrl(): string {
  return `${getAuthBaseUrl()}/api/auth`;
}
