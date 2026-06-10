import type { PostType } from "@/generated/prisma/client";
import { AnnouncementEmail } from "@/emails/announcement-email";
import { EventUpdateEmail } from "@/emails/event-update-email";
import { GuestInviteEmail } from "@/emails/guest-invite-email";
import { PaymentReminderEmail } from "@/emails/payment-reminder-email";
import { RsvpReminderEmail } from "@/emails/rsvp-reminder-email";
import { formatActivityTimeRange } from "@/lib/activities/format";
import { formatEventDateRange } from "@/lib/events/format";
import { formatMoney } from "@/lib/payments/format";
import { buildGuestInviteUrl } from "@/lib/guests/invite-url";
import type { GuestEmailRecipient } from "@/lib/email/guest-recipients";
import { sendEmailSafe, sendEmailsBulk, type BulkEmailResult } from "@/lib/email/send-email";

type PaymentAllocationRow = {
  amountCents: number;
  amountPaidCents: number;
  paymentItem: { title: string };
};

export async function sendGuestInviteEmailMessage({
  to,
  guestName,
  eventName,
  eventDate,
  organiserName,
  inviteUrl,
}: {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  organiserName: string;
  inviteUrl: string;
}) {
  return sendEmailSafe({
    to,
    subject: `You're invited to ${eventName}`,
    react: GuestInviteEmail({
      guestName,
      eventName,
      eventDate,
      organiserName,
      inviteUrl,
    }),
  });
}

export async function sendPostEmailsToGuests({
  eventName,
  postType,
  content,
  recipients,
}: {
  eventName: string;
  postType: PostType;
  content: string;
  recipients: GuestEmailRecipient[];
}): Promise<BulkEmailResult> {
  const emails = recipients.map((guest) => {
    const eventUrl = buildGuestInviteUrl(guest.inviteToken);
    const subject =
      postType === "ANNOUNCEMENT"
        ? `Announcement — ${eventName}`
        : `Update — ${eventName}`;

    const react =
      postType === "ANNOUNCEMENT"
        ? AnnouncementEmail({
            guestName: guest.name,
            eventName,
            content,
            eventUrl,
          })
        : EventUpdateEmail({
            guestName: guest.name,
            eventName,
            content,
            eventUrl,
          });

    return { to: guest.email, subject, react };
  });

  return sendEmailsBulk(emails);
}

export async function sendPaymentReminderEmailMessage({
  to,
  guestName,
  eventName,
  allocations,
  inviteToken,
}: {
  to: string;
  guestName: string;
  eventName: string;
  allocations: PaymentAllocationRow[];
  inviteToken: string;
}) {
  let totalOwing = 0;
  const items = allocations
    .map((allocation) => {
      const owing = Math.max(
        0,
        allocation.amountCents - allocation.amountPaidCents,
      );
      totalOwing += owing;
      return {
        title: allocation.paymentItem.title,
        amountOwing: formatMoney(owing),
        owing,
      };
    })
    .filter((item) => item.owing > 0)
    .map(({ title, amountOwing }) => ({ title, amountOwing }));

  if (totalOwing <= 0) {
    return { success: false as const, error: "This guest has nothing outstanding." };
  }

  return sendEmailSafe({
    to,
    subject: `Payment reminder — ${eventName}`,
    react: PaymentReminderEmail({
      guestName,
      eventName,
      totalOutstanding: formatMoney(totalOwing),
      items,
      eventUrl: buildGuestInviteUrl(inviteToken),
    }),
  });
}

export async function sendRsvpReminderEmailMessage({
  to,
  guestName,
  eventName,
  activities,
  inviteToken,
}: {
  to: string;
  guestName: string;
  eventName: string;
  activities: { title: string; startsAt: Date; endsAt: Date | null }[];
  inviteToken: string;
}) {
  return sendEmailSafe({
    to,
    subject: `RSVP reminder — ${eventName}`,
    react: RsvpReminderEmail({
      guestName,
      eventName,
      activities: activities.map((activity) => ({
        title: activity.title,
        when: formatActivityTimeRange(activity.startsAt, activity.endsAt),
      })),
      eventUrl: buildGuestInviteUrl(inviteToken),
    }),
  });
}

export function formatEventDateForEmail(
  startsAt: Date | null,
  endsAt: Date | null,
) {
  return formatEventDateRange(startsAt, endsAt);
}
