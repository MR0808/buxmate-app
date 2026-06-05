import { RsvpStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type { GuestRsvpStatus } from "@/lib/rsvp-labels";

export type RsvpCounts = {
  going: number;
  maybe: number;
  notGoing: number;
  pending: number;
  total: number;
};

export function emptyRsvpCounts(): RsvpCounts {
  return { going: 0, maybe: 0, notGoing: 0, pending: 0, total: 0 };
}

export function aggregateRsvpCounts(
  rows: { status: RsvpStatus }[],
): RsvpCounts {
  const counts = emptyRsvpCounts();
  for (const row of rows) {
    counts.total += 1;
    switch (row.status) {
      case RsvpStatus.GOING:
        counts.going += 1;
        break;
      case RsvpStatus.MAYBE:
        counts.maybe += 1;
        break;
      case RsvpStatus.NOT_GOING:
        counts.notGoing += 1;
        break;
      default:
        counts.pending += 1;
    }
  }
  return counts;
}

export async function getRsvpCountsForActivity(
  activityId: string,
): Promise<RsvpCounts> {
  const rsvps = await prisma.activityRsvp.findMany({
    where: { activityId },
    select: { status: true },
  });
  return aggregateRsvpCounts(rsvps);
}

export async function getRsvpCountsForEventActivities(eventId: string) {
  const rsvps = await prisma.activityRsvp.findMany({
    where: { activity: { eventId } },
    select: { activityId: true, status: true },
  });

  const byActivity = new Map<string, RsvpCounts>();

  for (const rsvp of rsvps) {
    const current = byActivity.get(rsvp.activityId) ?? emptyRsvpCounts();
    current.total += 1;
    switch (rsvp.status) {
      case RsvpStatus.GOING:
        current.going += 1;
        break;
      case RsvpStatus.MAYBE:
        current.maybe += 1;
        break;
      case RsvpStatus.NOT_GOING:
        current.notGoing += 1;
        break;
      default:
        current.pending += 1;
    }
    byActivity.set(rsvp.activityId, current);
  }

  return byActivity;
}

export async function getEventRsvpResponseCount(eventId: string) {
  return prisma.activityRsvp.count({
    where: {
      activity: { eventId },
      status: { not: RsvpStatus.PENDING },
    },
  });
}
