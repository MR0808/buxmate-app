import { notFound } from "next/navigation";
import { EventStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";

const eventListSelect = {
  id: true,
  name: true,
  slug: true,
  eventType: true,
  location: true,
  description: true,
  status: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type OrganiserEventListItem = {
  id: string;
  name: string;
  slug: string;
  eventType: string;
  location: string | null;
  description: string | null;
  status: EventStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrganiserEvents() {
  const session = await requireVerifiedOrganiser();

  return prisma.event.findMany({
    where: { organiserId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: eventListSelect,
  });
}

export async function getOrganiserEvent(eventId: string) {
  const session = await requireVerifiedOrganiser();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organiserId: session.user.id,
    },
    select: eventListSelect,
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
          location: true,
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
          location: true,
        },
      }),
    ]);

  return {
    total,
    active,
    draft,
    archived,
    nextUpcoming,
    recentEvents,
  };
}
