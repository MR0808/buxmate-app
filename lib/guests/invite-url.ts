import { getPublicAppUrl } from "@/lib/env";

function getInviteBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getPublicAppUrl();
}

export function buildGuestInviteUrl(inviteToken: string): string {
  return `${getInviteBaseUrl()}/join/${inviteToken}`;
}

export function buildGuestEventUrl(eventSlug: string): string {
  return `${getInviteBaseUrl()}/e/${eventSlug}`;
}
