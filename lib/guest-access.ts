import {
  ActivityStatus,
  EventStatus,
  GuestStatus,
  RsvpStatus,
} from "@/generated/prisma/client";
import { readGuestSessionCookie } from "@/lib/guest-session";
import { getGuestPaymentData } from "@/lib/payments";
import { getGuestEventPosts } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

async function loadGuestFromSession(eventSlug: string) {
  const session = await readGuestSessionCookie();

  if (!session || session.eventSlug !== eventSlug) {
    return null;
  }

  const guest = await prisma.eventGuest.findFirst({
    where: {
      id: session.guestId,
      event: { slug: eventSlug },
    },
    select: {
      id: true,
      eventId: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      lastAccessedAt: true,
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          eventType: true,
          location: true,
          description: true,
          status: true,
          startsAt: true,
          endsAt: true,
          paymentInstructions: true,
        },
      },
    },
  });

  if (!guest) {
    return null;
  }

  if (
    guest.status === GuestStatus.ARCHIVED ||
    guest.event.status === EventStatus.ARCHIVED
  ) {
    return null;
  }

  return guest;
}

export async function getGuestEventPageData(eventSlug: string) {
  const guest = await loadGuestFromSession(eventSlug);
  if (!guest) {
    return null;
  }

  const activities = await prisma.activity.findMany({
    where: {
      eventId: guest.eventId,
      status: ActivityStatus.ACTIVE,
    },
    orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      startsAt: true,
      endsAt: true,
      costCents: true,
      rsvps: {
        where: { guestId: guest.id },
        select: { status: true },
        take: 1,
      },
    },
  });

  const [payments, posts] = await Promise.all([
    getGuestPaymentData(guest.eventId, guest.id),
    getGuestEventPosts(guest.eventId),
  ]);

  await prisma.eventGuest.update({
    where: { id: guest.id },
    data: { lastAccessedAt: new Date() },
  });

  return {
    guest,
    payments,
    posts,
    activities: activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      location: activity.location,
      startsAt: activity.startsAt,
      endsAt: activity.endsAt,
      costCents: activity.costCents,
      rsvpStatus: activity.rsvps[0]?.status ?? RsvpStatus.PENDING,
    })),
  };
}

export async function validateInviteForJoin(token: string) {
  const guest = await prisma.eventGuest.findFirst({
    where: { inviteToken: token },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      inviteTokenExpiresAt: true,
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          location: true,
          description: true,
          status: true,
          startsAt: true,
          endsAt: true,
        },
      },
    },
  });

  if (!guest) {
    return null;
  }

  if (guest.status === GuestStatus.ARCHIVED) {
    return { invalid: "guest_archived" as const };
  }

  if (guest.event.status === EventStatus.ARCHIVED) {
    return { invalid: "event_archived" as const };
  }

  if (
    guest.inviteTokenExpiresAt &&
    guest.inviteTokenExpiresAt < new Date()
  ) {
    return { invalid: "expired" as const };
  }

  return { guest };
}
