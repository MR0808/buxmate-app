import { notFound } from "next/navigation";
import {
  ActivityStatus,
  GuestStatus,
  PaymentItemStatus,
  PaymentStatus,
  RsvpStatus,
} from "@/generated/prisma/client";
import { deriveAllocationStatus } from "@/lib/payments/format";
import { prisma } from "@/lib/prisma";
import { getOrganiserEvent } from "@/lib/events";
import type { AllocationMode } from "@/lib/validations/payment";

export const paymentItemSelect = {
  id: true,
  eventId: true,
  activityId: true,
  title: true,
  description: true,
  amountCents: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  activity: {
    select: { id: true, title: true },
  },
  allocations: {
    select: {
      id: true,
      guestId: true,
      amountCents: true,
      amountPaidCents: true,
      status: true,
      paidAt: true,
      guest: {
        select: { id: true, name: true, status: true },
      },
    },
  },
} as const;

export async function resolveAllocationGuestIds(
  eventId: string,
  mode: AllocationMode,
  activityId?: string | null,
): Promise<string[]> {
  if (mode === "EQUAL_ACTIVITY_GOING") {
    if (!activityId) return [];

    const going = await prisma.activityRsvp.findMany({
      where: {
        activityId,
        status: RsvpStatus.GOING,
        guest: {
          eventId,
          status: { not: GuestStatus.ARCHIVED },
        },
      },
      select: { guestId: true },
    });

    return going.map((row) => row.guestId);
  }

  const guests = await prisma.eventGuest.findMany({
    where: {
      eventId,
      status: { not: GuestStatus.ARCHIVED },
    },
    select: { id: true },
    orderBy: { name: "asc" },
  });

  return guests.map((guest) => guest.id);
}

export function summariseAllocations(
  allocations: {
    amountCents: number;
    amountPaidCents: number;
    status: PaymentStatus;
  }[],
) {
  let allocated = 0;
  let paid = 0;

  for (const allocation of allocations) {
    allocated += allocation.amountCents;
    paid += allocation.amountPaidCents;
  }

  return {
    allocated,
    paid,
    outstanding: Math.max(0, allocated - paid),
  };
}

export async function getOrganiserPaymentsPageData(eventId: string) {
  await getOrganiserEvent(eventId);

  const [paymentItems, guests] = await Promise.all([
    prisma.paymentItem.findMany({
      where: { eventId, status: PaymentItemStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      select: paymentItemSelect,
    }),
    prisma.eventGuest.findMany({
      where: { eventId, status: { not: GuestStatus.ARCHIVED } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        status: true,
        paymentAllocations: {
          where: {
            paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
          },
          select: {
            amountCents: true,
            amountPaidCents: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const eventTotals = paymentItems.reduce(
    (acc, item) => {
      acc.totalCost += item.amountCents;
      const itemSummary = summariseAllocations(item.allocations);
      acc.allocated += itemSummary.allocated;
      acc.paid += itemSummary.paid;
      return acc;
    },
    { totalCost: 0, allocated: 0, paid: 0 },
  );

  const guestBalances = guests.map((guest) => {
    const summary = summariseAllocations(guest.paymentAllocations);
    const status = deriveAllocationStatus(summary.allocated, summary.paid);
    return {
      guestId: guest.id,
      name: guest.name,
      guestStatus: guest.status,
      owed: summary.allocated,
      paid: summary.paid,
      outstanding: summary.outstanding,
      paymentStatus: status,
    };
  });

  return {
    paymentItems,
    guestBalances,
    summary: {
      totalCost: eventTotals.totalCost,
      allocated: eventTotals.allocated,
      paid: eventTotals.paid,
      outstanding: Math.max(0, eventTotals.allocated - eventTotals.paid),
    },
  };
}

export async function getOrganiserPaymentItem(
  eventId: string,
  paymentItemId: string,
) {
  await getOrganiserEvent(eventId);

  const item = await prisma.paymentItem.findFirst({
    where: { id: paymentItemId, eventId },
    select: paymentItemSelect,
  });

  if (!item) {
    notFound();
  }

  return item;
}

export async function getEventPaymentSummary(eventId: string) {
  const data = await getOrganiserPaymentsPageData(eventId);
  return data.summary;
}

export async function getGuestPaymentData(
  eventId: string,
  guestId: string,
) {
  const allocations = await prisma.paymentAllocation.findMany({
    where: {
      guestId,
      paymentItem: {
        eventId,
        status: PaymentItemStatus.ACTIVE,
      },
    },
    orderBy: { paymentItem: { createdAt: "desc" } },
    select: {
      id: true,
      amountCents: true,
      amountPaidCents: true,
      status: true,
      paidAt: true,
      paymentItem: {
        select: {
          id: true,
          title: true,
          description: true,
          activity: { select: { title: true } },
        },
      },
    },
  });

  const summary = summariseAllocations(allocations);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { paymentInstructions: true },
  });

  return {
    allocations,
    summary,
    paymentInstructions: event?.paymentInstructions ?? null,
  };
}

export async function getActiveActivitiesForPaymentForm(eventId: string) {
  return prisma.activity.findMany({
    where: { eventId, status: ActivityStatus.ACTIVE },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, startsAt: true },
  });
}
