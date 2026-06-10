import { notFound } from "next/navigation";
import { EventStatus, GuestStatus } from "@/generated/prisma/client";
import { attachCoverSignedUrls } from "@/lib/covers/queries";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";

const eventBaseSelect = {
  id: true,
  name: true,
  slug: true,
  eventType: true,
  location: true,
  description: true,
  coverPath: true,
  status: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const eventListSelect = {
  ...eventBaseSelect,
  _count: {
    select: {
      guests: {
        where: { status: { not: GuestStatus.ARCHIVED } },
      },
    },
  },
} as const;

export type OrganiserEventListItem = {
  id: string;
  name: string;
  slug: string;
  eventType: string;
  location: string | null;
  description: string | null;
  coverPath: string | null;
  coverSignedUrl: string | null;
  status: EventStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  guestCount: number;
};

export async function getOrganiserEvents() {
  const session = await requireVerifiedOrganiser();

  const events = await prisma.event.findMany({
    where: { organiserId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: eventListSelect,
  });

  const withCovers = await attachCoverSignedUrls(events);

  return withCovers.map((event) => ({
    id: event.id,
    name: event.name,
    slug: event.slug,
    eventType: event.eventType,
    location: event.location,
    description: event.description,
    coverPath: event.coverPath,
    coverSignedUrl: event.coverSignedUrl,
    status: event.status,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    guestCount: event._count.guests,
  }));
}

export async function getOrganiserEvent(eventId: string) {
  const session = await requireVerifiedOrganiser();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organiserId: session.user.id,
    },
    select: eventBaseSelect,
  });

  if (!event) {
    notFound();
  }

  return event;
}

export async function getDashboardEventStats() {
  const session = await requireVerifiedOrganiser();
  const organiserId = session.user.id;
  const now = new Date();

  const [total, active, draft, archived, nextUpcoming, recentEvents] =
    await Promise.all([
      prisma.event.count({ where: { organiserId } }),
      prisma.event.count({
        where: { organiserId, status: EventStatus.ACTIVE },
      }),
      prisma.event.count({
        where: { organiserId, status: EventStatus.DRAFT },
      }),
      prisma.event.count({
        where: { organiserId, status: EventStatus.ARCHIVED },
      }),
      prisma.event.findFirst({
        where: {
          organiserId,
          status: EventStatus.ACTIVE,
          startsAt: { gte: now },
        },
        orderBy: { startsAt: "asc" },
        select: {
          id: true,
          name: true,
          eventType: true,
          startsAt: true,
          endsAt: true,
          location: true,
          coverPath: true,
          status: true,
          _count: {
            select: {
              guests: {
                where: { status: { not: GuestStatus.ARCHIVED } },
              },
            },
          },
        },
      }),
      prisma.event.findMany({
        where: { organiserId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          eventType: true,
          status: true,
          startsAt: true,
          endsAt: true,
          location: true,
          coverPath: true,
          _count: {
            select: {
              guests: {
                where: { status: { not: GuestStatus.ARCHIVED } },
              },
            },
          },
        },
      }),
    ]);

  const [nextWithCover, recentWithCovers] = await Promise.all([
    nextUpcoming ? attachCoverSignedUrls([nextUpcoming]) : Promise.resolve([]),
    attachCoverSignedUrls(recentEvents),
  ]);

  return {
    total,
    active,
    draft,
    archived,
    nextUpcoming: nextWithCover[0]
      ? {
          id: nextWithCover[0].id,
          name: nextWithCover[0].name,
          eventType: nextWithCover[0].eventType,
          status: nextWithCover[0].status,
          startsAt: nextWithCover[0].startsAt,
          endsAt: nextWithCover[0].endsAt,
          location: nextWithCover[0].location,
          coverSignedUrl: nextWithCover[0].coverSignedUrl,
          guestCount: nextWithCover[0]._count.guests,
        }
      : null,
    recentEvents: recentWithCovers.map((event) => ({
      id: event.id,
      name: event.name,
      eventType: event.eventType,
      status: event.status,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      location: event.location,
      coverSignedUrl: event.coverSignedUrl,
      guestCount: event._count.guests,
    })),
  };
}
