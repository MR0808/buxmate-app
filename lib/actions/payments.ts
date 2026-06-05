"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  EventStatus,
  PaymentItemStatus,
  PaymentStatus,
} from "@/generated/prisma/client";
import { assertEventOwned } from "@/lib/activities";
import { dollarsToCents, splitAmountCents } from "@/lib/payments/format";
import { resolveAllocationGuestIds } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  createPaymentItemSchema,
  updatePaymentItemSchema,
  type CreatePaymentItemInput,
  type UpdatePaymentItemInput,
} from "@/lib/validations/payment";

type ActionResult =
  | { success: true; paymentItemId: string }
  | { success: false; error: string };

type SimpleResult =
  | { success: true }
  | { success: false; error: string };

async function getOwnedPaymentItemOrNotFound(
  eventId: string,
  paymentItemId: string,
  organiserId: string,
) {
  const item = await prisma.paymentItem.findFirst({
    where: {
      id: paymentItemId,
      eventId,
      event: { organiserId },
    },
    select: { id: true, status: true },
  });

  if (!item) {
    notFound();
  }

  return item;
}

async function getOwnedAllocationOrNotFound(
  eventId: string,
  allocationId: string,
  organiserId: string,
) {
  const allocation = await prisma.paymentAllocation.findFirst({
    where: {
      id: allocationId,
      paymentItem: { eventId, event: { organiserId } },
    },
    select: {
      id: true,
      amountCents: true,
      amountPaidCents: true,
      paymentItemId: true,
    },
  });

  if (!allocation) {
    notFound();
  }

  return allocation;
}

function revalidatePaymentPaths(eventId: string, paymentItemId?: string) {
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/payments`);
  if (paymentItemId) {
    revalidatePath(`/events/${eventId}/payments/${paymentItemId}`);
    revalidatePath(`/events/${eventId}/payments/${paymentItemId}/edit`);
  }
}

export async function createPaymentItem(
  eventId: string,
  input: CreatePaymentItemInput,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = createPaymentItemSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot add payments to an archived event.",
    };
  }

  const data = parsed.data;
  const activityId = data.activityId || null;

  if (activityId) {
    const activity = await prisma.activity.findFirst({
      where: { id: activityId, eventId },
      select: { id: true },
    });
    if (!activity) {
      return { success: false, error: "Selected activity was not found." };
    }
  }

  const guestIds = await resolveAllocationGuestIds(
    eventId,
    data.allocationMode,
    activityId,
  );

  if (guestIds.length === 0) {
    return {
      success: false,
      error:
        data.allocationMode === "EQUAL_ACTIVITY_GOING"
          ? "No guests with a Going RSVP for this activity. Ask guests to RSVP first, or split across all guests."
          : "Add guests before creating a payment item.",
    };
  }

  const amountCents = dollarsToCents(data.amount);
  const shares = splitAmountCents(amountCents, guestIds.length);

  const paymentItem = await prisma.$transaction(async (tx) => {
    const created = await tx.paymentItem.create({
      data: {
        eventId,
        activityId,
        title: data.title,
        description: data.description || null,
        amountCents,
        status: PaymentItemStatus.ACTIVE,
      },
    });

    await tx.paymentAllocation.createMany({
      data: guestIds.map((guestId, index) => ({
        paymentItemId: created.id,
        guestId,
        amountCents: shares[index],
        amountPaidCents: 0,
        status: PaymentStatus.PENDING,
      })),
    });

    return created;
  });

  revalidatePaymentPaths(eventId, paymentItem.id);

  return { success: true, paymentItemId: paymentItem.id };
}

export async function updatePaymentItem(
  eventId: string,
  paymentItemId: string,
  input: UpdatePaymentItemInput,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = updatePaymentItemSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  await assertEventOwned(eventId, session.user.id);
  await getOwnedPaymentItemOrNotFound(
    eventId,
    paymentItemId,
    session.user.id,
  );

  await prisma.paymentItem.update({
    where: { id: paymentItemId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
    },
  });

  revalidatePaymentPaths(eventId, paymentItemId);

  return { success: true };
}

export async function markAllocationPaid(
  eventId: string,
  allocationId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const allocation = await getOwnedAllocationOrNotFound(
    eventId,
    allocationId,
    session.user.id,
  );

  await prisma.paymentAllocation.update({
    where: { id: allocation.id },
    data: {
      amountPaidCents: allocation.amountCents,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  revalidatePaymentPaths(eventId, allocation.paymentItemId);
  revalidateGuestEventPaths(eventId);

  return { success: true };
}

export async function markAllocationUnpaid(
  eventId: string,
  allocationId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const allocation = await getOwnedAllocationOrNotFound(
    eventId,
    allocationId,
    session.user.id,
  );

  await prisma.paymentAllocation.update({
    where: { id: allocation.id },
    data: {
      amountPaidCents: 0,
      status: PaymentStatus.PENDING,
      paidAt: null,
    },
  });

  revalidatePaymentPaths(eventId, allocation.paymentItemId);
  revalidateGuestEventPaths(eventId);

  return { success: true };
}

async function revalidateGuestEventPaths(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });
  if (event?.slug) {
    revalidatePath(`/e/${event.slug}`);
  }
}
