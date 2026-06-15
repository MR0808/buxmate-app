import { notFound } from "next/navigation";
import { ActivityStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrganiserEvent } from "@/lib/events";

export const activityListSelect = {
  id: true,
  eventId: true,
  title: true,
  description: true,
  location: true,
  startsAt: true,
  endsAt: true,
  costCents: true,
  costType: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type OrganiserActivity = {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  costCents: number;
  costType: import("@/generated/prisma/client").ActivityCostType;
  status: ActivityStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

async function assertEventOwned(eventId: string, organiserId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId },
    select: { id: true, name: true, status: true, coverPath: true },
  });

  if (!event) {
    notFound();
  }

  return event;
}

export async function getOrganiserActivities(eventId: string) {
  await getOrganiserEvent(eventId);

  const activities = await prisma.activity.findMany({
    where: { eventId },
    orderBy: [{ status: "asc" }, { startsAt: "asc" }, { sortOrder: "asc" }],
    select: activityListSelect,
  });

  return activities;
}

export async function getOrganiserActivity(
  eventId: string,
  activityId: string,
) {
  await getOrganiserEvent(eventId);

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, eventId },
    select: activityListSelect,
  });

  if (!activity) {
    notFound();
  }

  return activity;
}

export async function getEventActivitySummary(eventId: string) {
  await getOrganiserEvent(eventId);
  const now = new Date();

  const [totalCount, activeCount, upcoming, nextActivity] = await Promise.all([
    prisma.activity.count({ where: { eventId } }),
    prisma.activity.count({
      where: { eventId, status: ActivityStatus.ACTIVE },
    }),
    prisma.activity.findMany({
      where: {
        eventId,
        status: ActivityStatus.ACTIVE,
        startsAt: { gte: now },
      },
      orderBy: { startsAt: "asc" },
      take: 3,
      select: activityListSelect,
    }),
    prisma.activity.findFirst({
      where: {
        eventId,
        status: ActivityStatus.ACTIVE,
        startsAt: { gte: now },
      },
      orderBy: { startsAt: "asc" },
      select: activityListSelect,
    }),
  ]);

  return {
    totalCount,
    activeCount,
    upcoming,
    nextActivity,
  };
}

export { assertEventOwned };
