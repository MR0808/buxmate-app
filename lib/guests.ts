import { notFound } from "next/navigation";
import { EventStatus, GuestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrganiserEvent } from "@/lib/events";

export const guestListSelect = {
  id: true,
  eventId: true,
  name: true,
  email: true,
  phone: true,
  avatarPath: true,
  inviteToken: true,
  inviteTokenExpiresAt: true,
  lastAccessedAt: true,
  inviteSentAt: true,
  inviteEmailCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type OrganiserGuest = {
  id: string;
  eventId: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarPath: string | null;
  inviteToken: string;
  inviteTokenExpiresAt: Date | null;
  lastAccessedAt: Date | null;
  inviteSentAt: Date | null;
  inviteEmailCount: number;
  status: GuestStatus;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrganiserGuests(eventId: string) {
  await getOrganiserEvent(eventId);

  return prisma.eventGuest.findMany({
    where: { eventId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: guestListSelect,
  });
}

export async function getOrganiserGuest(eventId: string, guestId: string) {
  await getOrganiserEvent(eventId);

  const guest = await prisma.eventGuest.findFirst({
    where: { id: guestId, eventId },
    select: guestListSelect,
  });

  if (!guest) {
    notFound();
  }

  return guest;
}

export async function getEventGuestSummary(eventId: string) {
  await getOrganiserEvent(eventId);

  const [totalCount, invitedCount, joinedCount, recentGuests] =
    await Promise.all([
      prisma.eventGuest.count({
        where: { eventId, status: { not: GuestStatus.ARCHIVED } },
      }),
      prisma.eventGuest.count({
        where: { eventId, status: GuestStatus.INVITED },
      }),
      prisma.eventGuest.count({
        where: { eventId, status: GuestStatus.JOINED },
      }),
      prisma.eventGuest.findMany({
        where: { eventId, status: { not: GuestStatus.ARCHIVED } },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          status: true,
          email: true,
        },
      }),
    ]);

  return { totalCount, invitedCount, joinedCount, recentGuests };
}

type InviteInvalidReason = "guest_archived" | "event_archived" | "expired";

export async function getGuestByInviteToken(token: string) {
  const guest = await prisma.eventGuest.findFirst({
    where: { inviteToken: token },
    select: {
      id: true,
      name: true,
      status: true,
      inviteTokenExpiresAt: true,
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  });

  if (!guest) {
    return null;
  }

  if (guest.status === GuestStatus.ARCHIVED) {
    return { invalid: "guest_archived" satisfies InviteInvalidReason };
  }

  if (guest.event.status === EventStatus.ARCHIVED) {
    return { invalid: "event_archived" satisfies InviteInvalidReason };
  }

  if (
    guest.inviteTokenExpiresAt &&
    guest.inviteTokenExpiresAt < new Date()
  ) {
    return { invalid: "expired" satisfies InviteInvalidReason };
  }

  return { guest };
}

export async function getGuestForEventAccess(
  eventSlug: string,
  guestId: string,
) {
  const guest = await prisma.eventGuest.findFirst({
    where: {
      id: guestId,
      event: { slug: eventSlug },
    },
    select: {
      id: true,
      name: true,
      status: true,
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          eventType: true,
          location: true,
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

  if (
    guest.status === GuestStatus.ARCHIVED ||
    guest.event.status === EventStatus.ARCHIVED
  ) {
    return { invalid: true as const };
  }

  return { guest };
}

export async function touchGuestLastAccessed(guestId: string) {
  await prisma.eventGuest.update({
    where: { id: guestId },
    data: { lastAccessedAt: new Date() },
  });
}
