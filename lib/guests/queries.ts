import {
  ActivityStatus,
  GuestStatus,
  PaymentItemStatus,
  PhotoStatus,
  RsvpStatus,
  type Prisma,
} from "@/generated/prisma/client";
import { formatMoney } from "@/lib/payments/format";
import { notFound } from "next/navigation";
import { guestListSelect } from "@/lib/guests";
import {
  GUEST_STATUS_FILTER_MAP,
  type GuestListFilters,
  type GuestListItem,
  type GuestPaymentSummary,
  type GuestRsvpSummary,
} from "@/lib/guests/types";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import { aggregateRsvpCounts } from "@/lib/rsvp";

function buildRsvpSummary(
  rsvps: { status: RsvpStatus; activity: { status: ActivityStatus } }[],
): GuestRsvpSummary {
  const active = rsvps.filter(
    (rsvp) => rsvp.activity.status === ActivityStatus.ACTIVE,
  );
  const counts = aggregateRsvpCounts(active);
  return {
    going: counts.going,
    maybe: counts.maybe,
    notGoing: counts.notGoing,
    pending: counts.pending,
    total: counts.total,
  };
}

function buildPaymentSummary(
  allocations: { amountCents: number; amountPaidCents: number }[],
): GuestPaymentSummary {
  let owed = 0;
  let paid = 0;
  for (const allocation of allocations) {
    owed += allocation.amountCents;
    paid += allocation.amountPaidCents;
  }
  return {
    owed,
    paid,
    outstanding: Math.max(0, owed - paid),
  };
}

function formatRsvpSummaryText(summary: GuestRsvpSummary) {
  if (summary.total === 0) return "No RSVPs";
  const parts = [
    summary.going > 0 ? `${summary.going} going` : null,
    summary.maybe > 0 ? `${summary.maybe} maybe` : null,
    summary.notGoing > 0 ? `${summary.notGoing} not going` : null,
    summary.pending > 0 ? `${summary.pending} pending` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

function formatPaymentSummaryText(summary: GuestPaymentSummary) {
  if (summary.owed === 0) return "No payments";
  if (summary.outstanding === 0) return `Paid ${formatMoney(summary.paid)}`;
  return `Owing ${formatMoney(summary.outstanding)}`;
}

export async function getOrganiserGuestsList(
  eventId: string,
  filters: GuestListFilters = {},
): Promise<GuestListItem[]> {
  const session = await requireVerifiedOrganiser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId: session.user.id },
    select: { id: true },
  });

  if (!event) {
    notFound();
  }

  const where: Prisma.EventGuestWhereInput = { eventId };

  if (filters.status && filters.status !== "all") {
    where.status = GUEST_STATUS_FILTER_MAP[filters.status];
  }

  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.EventGuestOrderByWithRelationInput[];
  switch (filters.sort) {
    case "oldest":
      orderBy = [{ createdAt: "asc" }];
      break;
    case "recent":
      orderBy = [{ lastAccessedAt: { sort: "desc", nulls: "last" } }];
      break;
    case "name":
      orderBy = [{ name: "asc" }];
      break;
    case "newest":
    default:
      orderBy = [{ createdAt: "desc" }];
      break;
  }

  const [guests, activeActivityCount] = await Promise.all([
    prisma.eventGuest.findMany({
      where,
      orderBy,
      select: {
        ...guestListSelect,
        rsvps: {
          select: {
            status: true,
            activity: { select: { status: true, id: true } },
          },
        },
        paymentAllocations: {
          where: {
            paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
          },
          select: { amountCents: true, amountPaidCents: true },
        },
      },
    }),
    prisma.activity.count({
      where: { eventId, status: ActivityStatus.ACTIVE },
    }),
  ]);

  return guests.map((guest) => {
    const rsvpSummary = buildRsvpSummary(guest.rsvps);
    const paymentSummary = buildPaymentSummary(guest.paymentAllocations);
    const activeRsvps = guest.rsvps.filter(
      (rsvp) => rsvp.activity.status === ActivityStatus.ACTIVE,
    );
    const respondedCount = activeRsvps.filter(
      (rsvp) => rsvp.status !== RsvpStatus.PENDING,
    ).length;
    const hasPendingRsvp =
      guest.status !== GuestStatus.ARCHIVED &&
      activeActivityCount > 0 &&
      respondedCount < activeActivityCount;

    const { rsvps: _rsvps, paymentAllocations: _paymentAllocations, ...base } =
      guest;

    return {
      ...base,
      rsvpSummary,
      paymentSummary,
      hasPendingRsvp,
    };
  });
}

export async function getGuestExportRows(eventId: string) {
  const guests = await getOrganiserGuestsList(eventId, { status: "all" });

  return guests.map((guest) => ({
    name: guest.name,
    email: guest.email ?? "",
    phone: guest.phone ?? "",
    status: guest.status.toLowerCase(),
    joinedDate:
      guest.status === GuestStatus.JOINED
        ? guest.updatedAt.toISOString().slice(0, 10)
        : "",
    rsvpSummary: formatRsvpSummaryText(guest.rsvpSummary),
    paymentSummary: formatPaymentSummaryText(guest.paymentSummary),
  }));
}

export async function getGuestProfile(eventId: string, guestId: string) {
  const session = await requireVerifiedOrganiser();

  const guest = await prisma.eventGuest.findFirst({
    where: {
      id: guestId,
      eventId,
      event: { organiserId: session.user.id },
    },
    select: {
      ...guestListSelect,
      rsvps: {
        orderBy: { activity: { startsAt: "asc" } },
        select: {
          status: true,
          updatedAt: true,
          activity: {
            select: {
              id: true,
              title: true,
              startsAt: true,
              endsAt: true,
              status: true,
            },
          },
        },
      },
      paymentAllocations: {
        where: {
          paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
        },
        orderBy: { paymentItem: { createdAt: "desc" } },
        select: {
          amountCents: true,
          amountPaidCents: true,
          status: true,
          paymentItem: {
            select: { id: true, title: true },
          },
        },
      },
      uploadedPhotos: {
        where: { status: PhotoStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, caption: true, createdAt: true },
      },
    },
  });

  if (!guest) {
    notFound();
  }

  const rsvpSummary = buildRsvpSummary(guest.rsvps);
  const paymentSummary = buildPaymentSummary(guest.paymentAllocations);

  const activityRsvps = guest.rsvps
    .filter((rsvp) => rsvp.activity.status === ActivityStatus.ACTIVE)
    .map((rsvp) => ({
      activityId: rsvp.activity.id,
      title: rsvp.activity.title,
      startsAt: rsvp.activity.startsAt,
      endsAt: rsvp.activity.endsAt,
      status: rsvp.status,
      updatedAt: rsvp.updatedAt,
    }));

  const recentActivity = [
    guest.inviteSentAt
      ? { type: "invite_sent" as const, at: guest.inviteSentAt, label: "Invite emailed" }
      : null,
    guest.lastAccessedAt
      ? { type: "opened" as const, at: guest.lastAccessedAt, label: "Opened invite" }
      : null,
    ...guest.uploadedPhotos.map((photo) => ({
      type: "photo" as const,
      at: photo.createdAt,
      label: photo.caption ? `Uploaded photo: ${photo.caption}` : "Uploaded a photo",
    })),
    ...guest.rsvps
      .filter((rsvp) => rsvp.status !== RsvpStatus.PENDING)
      .map((rsvp) => ({
        type: "rsvp" as const,
        at: rsvp.updatedAt,
        label: `RSVP ${rsvp.status.toLowerCase().replace("_", " ")} — ${rsvp.activity.title}`,
      })),
  ]
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const {
    rsvps: _rsvps,
    paymentAllocations,
    uploadedPhotos: _uploadedPhotos,
    ...base
  } = guest;

  return {
    guest: base,
    rsvpSummary,
    paymentSummary,
    activityRsvps,
    paymentItems: paymentAllocations.map((allocation) => ({
      id: allocation.paymentItem.id,
      title: allocation.paymentItem.title,
      owed: allocation.amountCents,
      paid: allocation.amountPaidCents,
      outstanding: Math.max(
        0,
        allocation.amountCents - allocation.amountPaidCents,
      ),
      status: allocation.status,
    })),
    recentActivity,
  };
}

export async function getGuestDashboardInsights(eventId: string) {
  const session = await requireVerifiedOrganiser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId: session.user.id },
    select: { id: true },
  });

  if (!event) {
    notFound();
  }

  const guests = await getOrganiserGuestsList(eventId, { status: "all" });

  const recentlyJoined = guests
    .filter((guest) => guest.status === GuestStatus.JOINED)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const needingRsvp = guests
    .filter(
      (guest) =>
        guest.status !== GuestStatus.ARCHIVED && guest.hasPendingRsvp,
    )
    .slice(0, 5);

  const outstandingPayments = guests
    .filter(
      (guest) =>
        guest.status !== GuestStatus.ARCHIVED &&
        guest.paymentSummary.outstanding > 0,
    )
    .sort(
      (a, b) => b.paymentSummary.outstanding - a.paymentSummary.outstanding,
    )
    .slice(0, 5);

  const neverOpened = guests
    .filter(
      (guest) =>
        guest.status !== GuestStatus.ARCHIVED && !guest.lastAccessedAt,
    )
    .slice(0, 5);

  return {
    recentlyJoined,
    needingRsvp,
    outstandingPayments,
    neverOpened,
  };
}
