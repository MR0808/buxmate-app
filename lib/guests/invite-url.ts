import { getAppUrl } from "@/lib/email/app-url";

export function buildGuestInviteUrl(inviteToken: string): string {
  return `${getAppUrl()}/join/${inviteToken}`;
}

export function buildGuestEventUrl(eventSlug: string): string {
  return `${getAppUrl()}/e/${eventSlug}`;
}
