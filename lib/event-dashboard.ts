import { notFound } from "next/navigation";
import {
  ActivityStatus,
  EventStatus,
  GuestStatus,
  PaymentItemStatus,
  PhotoStatus,
  PostStatus,
  RsvpStatus,
  type PostType,
} from "@/generated/prisma/client";
import { activityListSelect } from "@/lib/activities";
import { getSignedPhotoUrls } from "@/lib/photos/storage";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import { resolveCoverSignedUrl } from "@/lib/covers/queries";
import { aggregateRsvpCounts, type RsvpCounts } from "@/lib/rsvp";

const postPreviewSelect = {
  id: true,
  type: true,
  content: true,
  pinned: true,
  createdAt: true,
  author: { select: { name: true } },
} as const;

export type DashboardUpcomingActivity = {
  id: string;
  title: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  rsvp: RsvpCounts;
};

export type DashboardAnnouncement = {
  id: string;
  type: PostType;
  content: string;
  pinned: boolean;
  createdAt: Date;
  authorName: string | null;
};

export type DashboardPhotoPreview = {
  id: string;
  signedUrl: string;
  caption: string | null;
};

export type DashboardOutstandingGuest = {
  guestId: string;
  name: string;
  outstanding: number;
};

export type EventCommandCentreData = {
  event: {
    id: string;
    name: string;
    slug: string;
    eventType: string;
    location: string | null;
    description: string | null;
    status: EventStatus;
    startsAt: Date | null;
    endsAt: Date | null;
    coverSignedUrl: string | null;
  };
  canManage: boolean;
  metrics: {
    guests: { total: number; joined: number };
    activities: { total: number; active: number; nextTitle: string | null };
    rsvps: { responded: number; pending: number };
    payments: { allocated: number; paid: number; outstanding: number };
    photos: { total: number };
    announcements: { total: number };
  };
  guestStatus: {
    total: number;
    invited: number;
    joined: number;
    declined: number;
    archived: number;
  };
  upcomingActivities: DashboardUpcomingActivity[];
  topOutstandingGuests: DashboardOutstandingGuest[];
  recentAnnouncements: DashboardAnnouncement[];
  recentPhotos: DashboardPhotoPreview[];
};

function countFromGroup<T extends string>(
  rows: { status: T; _count: number }[],
  status: T,
) {
  return rows.find((row) => row.status === status)?._count ?? 0;
}

export async function getEventCommandCentreData(
  eventId: string,
): Promise<EventCommandCentreData> {
  const session = await requireVerifiedOrganiser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId: session.user.id },
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
      coverPath: true,
    },
  });

  if (!event) {
    notFound();
  }

  const now = new Date();

  const [
    guestGroups,
    activityGroups,
    upcomingActivities,
    rsvpGroups,
    paymentItems,
    guestsWithAllocations,
    recentPosts,
    recentPhotoRows,
    photoCount,
    postCount,
    coverSignedUrl,
  ] = await Promise.all([
    prisma.eventGuest.groupBy({
      by: ["status"],
      where: { eventId },
      _count: true,
    }),
    prisma.activity.groupBy({
      by: ["status"],
      where: { eventId },
      _count: true,
    }),
    prisma.activity.findMany({
      where: {
        eventId,
        status: ActivityStatus.ACTIVE,
        startsAt: { gte: now },
      },
      orderBy: { startsAt: "asc" },
      take: 5,
      select: activityListSelect,
    }),
    prisma.activityRsvp.groupBy({
      by: ["status"],
      where: { activity: { eventId } },
      _count: true,
    }),
    prisma.paymentItem.findMany({
      where: { eventId, status: PaymentItemStatus.ACTIVE },
      select: {
        allocations: {
          select: { amountCents: true, amountPaidCents: true },
        },
      },
    }),
    prisma.eventGuest.findMany({
      where: { eventId, status: { not: GuestStatus.ARCHIVED } },
      select: {
        id: true,
        name: true,
        paymentAllocations: {
          where: {
            paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
          },
          select: { amountCents: true, amountPaidCents: true },
        },
      },
    }),
    prisma.post.findMany({
      where: { eventId, status: PostStatus.ACTIVE },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: postPreviewSelect,
    }),
    prisma.photo.findMany({
      where: { eventId, status: PhotoStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, storagePath: true, caption: true },
    }),
    prisma.photo.count({
      where: { eventId, status: PhotoStatus.ACTIVE },
    }),
    prisma.post.count({
      where: { eventId, status: PostStatus.ACTIVE },
    }),
    resolveCoverSignedUrl(event.coverPath),
  ]);

  const activityIds = upcomingActivities.map((activity) => activity.id);
  const activityRsvps =
    activityIds.length > 0
      ? await prisma.activityRsvp.findMany({
          where: { activityId: { in: activityIds } },
          select: { activityId: true, status: true },
        })
      : [];

  const rsvpByActivity = new Map<string, RsvpCounts>();
  for (const activityId of activityIds) {
    rsvpByActivity.set(activityId, aggregateRsvpCounts([]));
  }
  for (const rsvp of activityRsvps) {
    const current = rsvpByActivity.get(rsvp.activityId) ?? aggregateRsvpCounts([]);
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
    rsvpByActivity.set(rsvp.activityId, current);
  }

  const invited = countFromGroup(guestGroups, GuestStatus.INVITED);
  const joined = countFromGroup(guestGroups, GuestStatus.JOINED);
  const declined = countFromGroup(guestGroups, GuestStatus.DECLINED);
  const archived = countFromGroup(guestGroups, GuestStatus.ARCHIVED);
  const guestTotal = invited + joined + declined;

  const activeActivities = countFromGroup(activityGroups, ActivityStatus.ACTIVE);
  const totalActivities =
    countFromGroup(activityGroups, ActivityStatus.ACTIVE) +
    countFromGroup(activityGroups, ActivityStatus.ARCHIVED);

  const rsvpResponded =
    countFromGroup(rsvpGroups, RsvpStatus.GOING) +
    countFromGroup(rsvpGroups, RsvpStatus.MAYBE) +
    countFromGroup(rsvpGroups, RsvpStatus.NOT_GOING);
  const rsvpPending = countFromGroup(rsvpGroups, RsvpStatus.PENDING);

  let allocated = 0;
  let paid = 0;
  for (const item of paymentItems) {
    for (const allocation of item.allocations) {
      allocated += allocation.amountCents;
      paid += allocation.amountPaidCents;
    }
  }

  const topOutstandingGuests = guestsWithAllocations
    .map((guest) => {
      let owed = 0;
      let paidAmount = 0;
      for (const allocation of guest.paymentAllocations) {
        owed += allocation.amountCents;
        paidAmount += allocation.amountPaidCents;
      }
      return {
        guestId: guest.id,
        name: guest.name,
        outstanding: Math.max(0, owed - paidAmount),
      };
    })
    .filter((guest) => guest.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 5);

  const signedPhotoUrls = await getSignedPhotoUrls(
    recentPhotoRows.map((photo) => photo.storagePath),
  );

  const recentPhotos: DashboardPhotoPreview[] = recentPhotoRows
    .map((photo) => {
      const signedUrl = signedPhotoUrls.get(photo.storagePath);
      if (!signedUrl) {
        return null;
      }
      return {
        id: photo.id,
        signedUrl,
        caption: photo.caption,
      };
    })
    .filter((photo): photo is DashboardPhotoPreview => photo !== null);

  return {
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug,
      eventType: event.eventType,
      location: event.location,
      description: event.description,
      status: event.status,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      coverSignedUrl,
    },
    canManage: event.status !== EventStatus.ARCHIVED,
    metrics: {
      guests: { total: guestTotal, joined },
      activities: {
        total: totalActivities,
        active: activeActivities,
        nextTitle: upcomingActivities[0]?.title ?? null,
      },
      rsvps: { responded: rsvpResponded, pending: rsvpPending },
      payments: {
        allocated,
        paid,
        outstanding: Math.max(0, allocated - paid),
      },
      photos: { total: photoCount },
      announcements: { total: postCount },
    },
    guestStatus: {
      total: guestTotal,
      invited,
      joined,
      declined,
      archived,
    },
    upcomingActivities: upcomingActivities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      location: activity.location,
      startsAt: activity.startsAt,
      endsAt: activity.endsAt,
      rsvp: rsvpByActivity.get(activity.id) ?? aggregateRsvpCounts([]),
    })),
    topOutstandingGuests,
    recentAnnouncements: recentPosts.map((post) => ({
      id: post.id,
      type: post.type,
      content: post.content,
      pinned: post.pinned,
      createdAt: post.createdAt,
      authorName: post.author?.name ?? null,
    })),
    recentPhotos,
  };
}
