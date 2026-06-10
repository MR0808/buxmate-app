import { sendGTMEvent } from "@next/third-parties/google";

/** Allowed analytics event names — no PII or private content in payloads. */
export const ANALYTICS_EVENTS = [
  "sign_up_completed",
  "login_completed",
  "event_created",
  "activity_created",
  "guest_added",
  "invite_email_sent",
  "guest_joined",
  "rsvp_submitted",
  "payment_item_created",
  "payment_marked_paid",
  "announcement_created",
  "photo_uploaded",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsEventCategory =
  | "auth"
  | "event"
  | "guest"
  | "activity"
  | "payment"
  | "content";

/** Safe payload fields only — never include names, emails, IDs, amounts, or content. */
export type AnalyticsPayload = {
  event_category?: AnalyticsEventCategory;
  event_label?: string;
  status?: string;
  count?: number;
  source?: string;
  method?: string;
};

export function getGtmId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  return id || undefined;
}

export function isAnalyticsEnabled(): boolean {
  return Boolean(getGtmId());
}

/**
 * Push a privacy-safe event to GTM dataLayer.
 * Client-only; no-ops when GTM is not configured or on the server.
 */
export function trackEvent(
  event: AnalyticsEvent,
  payload?: AnalyticsPayload,
): void {
  if (!isAnalyticsEnabled() || typeof window === "undefined") {
    return;
  }

  sendGTMEvent({
    event,
    ...payload,
  });
}
