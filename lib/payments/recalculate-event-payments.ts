import {
  PaymentItemStatus,
  PaymentStatus,
} from "@/generated/prisma/client";
import {
  calculateAllocationAmounts,
  derivePaymentStatus,
  resolveEligibleGuestIds,
} from "@/lib/payments/allocation-engine";
import { prisma } from "@/lib/prisma";

type RecalculateOptions = {
  paymentItemId?: string;
  activityId?: string;
};

function allocationIsPaid(allocation: {
  status: PaymentStatus;
  amountPaidCents: number;
}) {
  return (
    allocation.status === PaymentStatus.PAID ||
    allocation.amountPaidCents > 0
  );
}

export async function recalculatePaymentItem(paymentItemId: string) {
  const item = await prisma.paymentItem.findFirst({
    where: {
      id: paymentItemId,
      status: PaymentItemStatus.ACTIVE,
    },
    include: {
      activity: {
        select: {
          id: true,
          costType: true,
          costCents: true,
          status: true,
        },
      },
      allocations: true,
    },
  });

  if (!item) {
    return { updated: 0, flagged: 0 };
  }

  const guestIds = await resolveEligibleGuestIds(
    item.eventId,
    item.allocationMethod,
    {
      activityId: item.activityId,
      excludeGuestOfHonour: item.excludeGuestOfHonour,
    },
  );

  const targetAmounts = calculateAllocationAmounts(item, guestIds);
  const existingByGuest = new Map(
    item.allocations.map((allocation) => [allocation.guestId, allocation]),
  );

  let updated = 0;
  let flagged = 0;

  for (const [guestId, amountCents] of targetAmounts) {
    const existing = existingByGuest.get(guestId);

    if (existing) {
      existingByGuest.delete(guestId);

      if (existing.isManualOverride) {
        continue;
      }

      if (allocationIsPaid(existing)) {
        if (existing.amountCents !== amountCents) {
          await prisma.paymentAllocation.update({
            where: { id: existing.id },
            data: { needsReview: true },
          });
          flagged += 1;
        }
        continue;
      }

      if (existing.amountCents !== amountCents) {
        await prisma.paymentAllocation.update({
          where: { id: existing.id },
          data: {
            amountCents,
            needsReview: false,
            status: derivePaymentStatus(amountCents, existing.amountPaidCents),
          },
        });
        updated += 1;
      }
      continue;
    }

    await prisma.paymentAllocation.create({
      data: {
        paymentItemId: item.id,
        guestId,
        amountCents,
        amountPaidCents: 0,
        status: PaymentStatus.PENDING,
      },
    });
    updated += 1;
  }

  for (const allocation of existingByGuest.values()) {
    if (allocation.isManualOverride) {
      continue;
    }

    if (allocationIsPaid(allocation)) {
      await prisma.paymentAllocation.update({
        where: { id: allocation.id },
        data: { needsReview: true },
      });
      flagged += 1;
      continue;
    }

    await prisma.paymentAllocation.delete({
      where: { id: allocation.id },
    });
    updated += 1;
  }

  return { updated, flagged };
}

export async function recalculateEventPayments(
  eventId: string,
  options: RecalculateOptions = {},
) {
  const where = {
    eventId,
    status: PaymentItemStatus.ACTIVE,
    ...(options.paymentItemId ? { id: options.paymentItemId } : {}),
    ...(options.activityId ? { activityId: options.activityId } : {}),
  };

  const items = await prisma.paymentItem.findMany({
    where,
    select: { id: true },
  });

  let totalUpdated = 0;
  let totalFlagged = 0;

  for (const item of items) {
    const result = await recalculatePaymentItem(item.id);
    totalUpdated += result.updated;
    totalFlagged += result.flagged;
  }

  return { updated: totalUpdated, flagged: totalFlagged };
}

export async function countAllocationsNeedingReview(eventId: string) {
  return prisma.paymentAllocation.count({
    where: {
      needsReview: true,
      paymentItem: {
        eventId,
        status: PaymentItemStatus.ACTIVE,
      },
    },
  });
}
