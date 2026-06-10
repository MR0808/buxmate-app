"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  ActivityStatus,
  EventStatus,
  GuestStatus,
  PaymentItemStatus,
  RsvpStatus,
} from "@/generated/prisma/client";
import { assertEventOwned } from "@/lib/activities";
import { formatActivityTimeRange } from "@/lib/activities/format";
import { PaymentReminderEmail } from "@/emails/payment-reminder-email";
import { RsvpReminderEmail } from "@/emails/rsvp-reminder-email";
import {
  formatEventDateForEmail,
  sendGuestInviteEmailMessage,
  sendPaymentReminderEmailMessage,
} from "@/lib/email/event-emails";
import { getGuestEmailRecipients } from "@/lib/email/guest-recipients";
import { buildGuestInviteUrl } from "@/lib/guests/invite-url";
import { formatMoney } from "@/lib/payments/format";
import { sendEmailsBulk } from "@/lib/email/send-email";
import { GuestInviteEmail } from "@/emails/guest-invite-email";
import { auditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import { bulkGuestIdsSchema } from "@/lib/validations/guest-bulk";

type SimpleResult =
  | { success: true }
  | { success: false; error: string };

export type BulkEmailActionResult =
  | {
      success: true;
      sent: number;
      skipped: number;
      failed: number;
      errors: string[];
    }
  | { success: false; error: string };

async function getOwnedGuestOrNotFound(
  eventId: string,
  guestId: string,
  organiserId: string,
) {
  const guest = await prisma.eventGuest.findFirst({
    where: {
      id: guestId,
      eventId,
      event: { organiserId },
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      inviteToken: true,
      event: {
        select: {
          name: true,
          startsAt: true,
          endsAt: true,
          status: true,
          organiser: { select: { name: true } },
        },
      },
    },
  });

  if (!guest) {
    notFound();
  }

  return guest;
}

function bulkResultMessage(result: {
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
}): BulkEmailActionResult {
  if (result.sent === 0 && result.failed > 0) {
    return {
      success: false,
      error: result.errors[0] ?? "Could not send any emails.",
    };
  }

  return {
    success: true,
    sent: result.sent,
    skipped: result.skipped,
    failed: result.failed,
    errors: result.errors,
  };
}

export async function sendGuestInviteEmail(
  eventId: string,
  guestId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const guest = await getOwnedGuestOrNotFound(eventId, guestId, session.user.id);

  if (guest.status === GuestStatus.ARCHIVED) {
    return { success: false, error: "Cannot email an archived guest." };
  }

  if (guest.event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot send invites for an archived event." };
  }

  const email = guest.email?.trim();
  if (!email) {
    return { success: false, error: "This guest does not have an email address." };
  }

  const result = await sendGuestInviteEmailMessage({
    to: email,
    guestName: guest.name,
    eventName: guest.event.name,
    eventDate: formatEventDateForEmail(guest.event.startsAt, guest.event.endsAt),
    organiserName: guest.event.organiser.name,
    inviteUrl: buildGuestInviteUrl(guest.inviteToken),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  await prisma.eventGuest.update({
    where: { id: guest.id },
    data: {
      inviteSentAt: new Date(),
      inviteEmailCount: { increment: 1 },
    },
  });

  revalidatePath(`/events/${eventId}/guests`);
  revalidatePath(`/events/${eventId}/guests/${guestId}`);

  auditLog("guest.invited", {
    userId: session.user.id,
    eventId,
    guestId,
  });

  return { success: true };
}

export async function sendPaymentReminderEmail(
  eventId: string,
  guestId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const guest = await getOwnedGuestOrNotFound(eventId, guestId, session.user.id);

  if (guest.status === GuestStatus.ARCHIVED) {
    return { success: false, error: "Cannot email an archived guest." };
  }

  const email = guest.email?.trim();
  if (!email) {
    return { success: false, error: "This guest does not have an email address." };
  }

  const allocations = await prisma.paymentAllocation.findMany({
    where: {
      guestId: guest.id,
      paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
    },
    select: {
      amountCents: true,
      amountPaidCents: true,
      paymentItem: { select: { title: true } },
    },
  });

  const result = await sendPaymentReminderEmailMessage({
    to: email,
    guestName: guest.name,
    eventName: guest.event.name,
    allocations,
    inviteToken: guest.inviteToken,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

export async function sendPaymentReminderEmailsBulk(
  eventId: string,
): Promise<BulkEmailActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot send reminders for an archived event." };
  }

  const guests = await prisma.eventGuest.findMany({
    where: {
      eventId,
      status: { not: GuestStatus.ARCHIVED },
      email: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      inviteToken: true,
      paymentAllocations: {
        where: {
          paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
        },
        select: {
          amountCents: true,
          amountPaidCents: true,
          paymentItem: { select: { title: true } },
        },
      },
    },
  });

  const bulkEmails = [];

  for (const guest of guests) {
    const email = guest.email?.trim();
    if (!email) continue;

    let totalOwing = 0;
    const items = guest.paymentAllocations
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

    if (totalOwing <= 0) continue;

    bulkEmails.push({
      to: email,
      subject: `Payment reminder — ${event.name}`,
      react: PaymentReminderEmail({
        guestName: guest.name,
        eventName: event.name,
        totalOutstanding: formatMoney(totalOwing),
        items,
        eventUrl: buildGuestInviteUrl(guest.inviteToken),
      }),
    });
  }

  if (bulkEmails.length === 0) {
    return {
      success: false,
      error: "No guests with outstanding balances and email addresses.",
    };
  }

  const result = await sendEmailsBulk(bulkEmails);
  return bulkResultMessage(result);
}

export async function sendRsvpReminderEmailsBulk(
  eventId: string,
): Promise<BulkEmailActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot send reminders for an archived event." };
  }

  const [activities, guests] = await Promise.all([
    prisma.activity.findMany({
      where: { eventId, status: ActivityStatus.ACTIVE },
      orderBy: { startsAt: "asc" },
      select: { id: true, title: true, startsAt: true, endsAt: true },
    }),
    prisma.eventGuest.findMany({
      where: {
        eventId,
        status: { not: GuestStatus.ARCHIVED },
        email: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        inviteToken: true,
        rsvps: {
          where: {
            activity: { eventId, status: ActivityStatus.ACTIVE },
          },
          select: { activityId: true, status: true },
        },
      },
    }),
  ]);

  if (activities.length === 0) {
    return { success: false, error: "Add activities before sending RSVP reminders." };
  }

  const bulkEmails = [];

  for (const guest of guests) {
    const email = guest.email?.trim();
    if (!email) continue;

    const rsvpByActivity = new Map(
      guest.rsvps.map((rsvp) => [rsvp.activityId, rsvp.status]),
    );

    const pendingActivities = activities.filter((activity) => {
      const status = rsvpByActivity.get(activity.id);
      return !status || status === RsvpStatus.PENDING;
    });

    if (pendingActivities.length === 0) continue;

    bulkEmails.push({
      to: email,
      subject: `RSVP reminder — ${event.name}`,
      react: RsvpReminderEmail({
        guestName: guest.name,
        eventName: event.name,
        activities: pendingActivities.map((activity) => ({
          title: activity.title,
          when: formatActivityTimeRange(activity.startsAt, activity.endsAt),
        })),
        eventUrl: buildGuestInviteUrl(guest.inviteToken),
      }),
    });
  }

  if (bulkEmails.length === 0) {
    return {
      success: false,
      error: "No guests need an RSVP reminder, or none have email addresses.",
    };
  }

  const result = await sendEmailsBulk(bulkEmails);
  return bulkResultMessage(result);
}

export async function sendPostEmailsForEvent(
  eventId: string,
  postType: "ANNOUNCEMENT" | "UPDATE" | "NOTE",
  content: string,
): Promise<BulkEmailActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot email guests for an archived event." };
  }

  const recipients = await getGuestEmailRecipients(eventId);
  if (recipients.length === 0) {
    return {
      success: false,
      error: "No guests with email addresses to notify.",
    };
  }

  const { sendPostEmailsToGuests } = await import("@/lib/email/event-emails");
  const result = await sendPostEmailsToGuests({
    eventName: event.name,
    postType,
    content,
    recipients,
  });

  return bulkResultMessage(result);
}

async function verifyGuestIdsForEvent(
  eventId: string,
  organiserId: string,
  guestIds: string[],
): Promise<{ error: string } | { guestIds: string[] }> {
  const parsed = bulkGuestIdsSchema.safeParse(guestIds);
  if (!parsed.success) {
    return { error: "Select at least one guest." as const };
  }

  const uniqueIds = [...new Set(parsed.data)];
  const guests = await prisma.eventGuest.findMany({
    where: {
      id: { in: uniqueIds },
      eventId,
      event: { organiserId },
    },
  });

  if (guests.length !== uniqueIds.length) {
    return { error: "Some selected guests were not found." as const };
  }

  return { guestIds: uniqueIds };
}

export async function bulkSendGuestInviteEmails(
  eventId: string,
  guestIds: string[],
): Promise<BulkEmailActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot send invites for an archived event." };
  }

  const verified = await verifyGuestIdsForEvent(
    eventId,
    session.user.id,
    guestIds,
  );
  if ("error" in verified) {
    return { success: false, error: verified.error };
  }

  const guests = await prisma.eventGuest.findMany({
    where: {
      id: { in: verified.guestIds },
      status: { not: GuestStatus.ARCHIVED },
      email: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      inviteToken: true,
      event: {
        select: {
          name: true,
          startsAt: true,
          endsAt: true,
          organiser: { select: { name: true } },
        },
      },
    },
  });

  if (guests.length === 0) {
    return {
      success: false,
      error: "No selected guests have email addresses.",
    };
  }

  const eventDate = formatEventDateForEmail(
    guests[0]?.event.startsAt ?? null,
    guests[0]?.event.endsAt ?? null,
  );

  const bulkEmails = guests
    .map((guest) => {
      const email = guest.email?.trim();
      if (!email) return null;
      return {
        to: email,
        subject: `You're invited to ${guest.event.name}`,
        react: GuestInviteEmail({
          guestName: guest.name,
          eventName: guest.event.name,
          eventDate,
          organiserName: guest.event.organiser.name,
          inviteUrl: buildGuestInviteUrl(guest.inviteToken),
        }),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const result = await sendEmailsBulk(bulkEmails);

  if (result.sent > 0) {
    const now = new Date();
    await prisma.$transaction(
      guests.map((guest) =>
        prisma.eventGuest.update({
          where: { id: guest.id },
          data: {
            inviteSentAt: now,
            inviteEmailCount: { increment: 1 },
          },
        }),
      ),
    );
    revalidatePath(`/events/${eventId}/guests`);
  }

  return bulkResultMessage(result);
}

export async function bulkSendPaymentReminderEmails(
  eventId: string,
  guestIds: string[],
): Promise<BulkEmailActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot send reminders for an archived event." };
  }

  const verified = await verifyGuestIdsForEvent(
    eventId,
    session.user.id,
    guestIds,
  );
  if ("error" in verified) {
    return { success: false, error: verified.error };
  }

  const guests = await prisma.eventGuest.findMany({
    where: {
      id: { in: verified.guestIds },
      status: { not: GuestStatus.ARCHIVED },
      email: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      inviteToken: true,
      paymentAllocations: {
        where: {
          paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
        },
        select: {
          amountCents: true,
          amountPaidCents: true,
          paymentItem: { select: { title: true } },
        },
      },
    },
  });

  const bulkEmails = [];

  for (const guest of guests) {
    const email = guest.email?.trim();
    if (!email) continue;

    let totalOwing = 0;
    const items = guest.paymentAllocations
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

    if (totalOwing <= 0) continue;

    bulkEmails.push({
      to: email,
      subject: `Payment reminder — ${event.name}`,
      react: PaymentReminderEmail({
        guestName: guest.name,
        eventName: event.name,
        totalOutstanding: formatMoney(totalOwing),
        items,
        eventUrl: buildGuestInviteUrl(guest.inviteToken),
      }),
    });
  }

  if (bulkEmails.length === 0) {
    return {
      success: false,
      error: "No selected guests have outstanding balances and email addresses.",
    };
  }

  const result = await sendEmailsBulk(bulkEmails);
  return bulkResultMessage(result);
}

export async function bulkSendRsvpReminderEmails(
  eventId: string,
  guestIds: string[],
): Promise<BulkEmailActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot send reminders for an archived event." };
  }

  const verified = await verifyGuestIdsForEvent(
    eventId,
    session.user.id,
    guestIds,
  );
  if ("error" in verified) {
    return { success: false, error: verified.error };
  }

  const activities = await prisma.activity.findMany({
    where: { eventId, status: ActivityStatus.ACTIVE },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, startsAt: true, endsAt: true },
  });

  if (activities.length === 0) {
    return { success: false, error: "Add activities before sending RSVP reminders." };
  }

  const guests = await prisma.eventGuest.findMany({
    where: {
      id: { in: verified.guestIds },
      status: { not: GuestStatus.ARCHIVED },
      email: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      inviteToken: true,
      rsvps: {
        where: {
          activity: { eventId, status: ActivityStatus.ACTIVE },
        },
        select: { activityId: true, status: true },
      },
    },
  });

  const bulkEmails = [];

  for (const guest of guests) {
    const email = guest.email?.trim();
    if (!email) continue;

    const rsvpByActivity = new Map(
      guest.rsvps.map((rsvp) => [rsvp.activityId, rsvp.status]),
    );

    const pendingActivities = activities.filter((activity) => {
      const status = rsvpByActivity.get(activity.id);
      return !status || status === RsvpStatus.PENDING;
    });

    if (pendingActivities.length === 0) continue;

    bulkEmails.push({
      to: email,
      subject: `RSVP reminder — ${event.name}`,
      react: RsvpReminderEmail({
        guestName: guest.name,
        eventName: event.name,
        activities: pendingActivities.map((activity) => ({
          title: activity.title,
          when: formatActivityTimeRange(activity.startsAt, activity.endsAt),
        })),
        eventUrl: buildGuestInviteUrl(guest.inviteToken),
      }),
    });
  }

  if (bulkEmails.length === 0) {
    return {
      success: false,
      error: "No selected guests need an RSVP reminder.",
    };
  }

  const result = await sendEmailsBulk(bulkEmails);
  return bulkResultMessage(result);
}
