"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  EventStatus,
  GuestStatus,
  PaymentStatus,
  PostStatus,
} from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";
import { generateUniqueInviteToken } from "@/lib/guests/invite-token";
import { prisma } from "@/lib/prisma";
import { generateUniqueEventSlug } from "@/lib/events/slug";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  createEventSchema,
  parseEventDates,
  updateEventSchema,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/lib/validations/event";
import { duplicateEventSchema } from "@/lib/validations/settings";

type ActionResult =
  | { success: true; eventId: string }
  | { success: false; error: string };

type SimpleResult =
  | { success: true }
  | { success: false; error: string };

async function getOwnedEventOrNotFound(eventId: string, organiserId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, organiserId },
    select: { id: true, status: true },
  });

  if (!event) {
    notFound();
  }

  return event;
}

export async function createEvent(
  input: CreateEventInput,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = createEventSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const data = parsed.data;
  const slug = await generateUniqueEventSlug(data.name);
  const { startsAt, endsAt } = parseEventDates(data);

  const event = await prisma.event.create({
    data: {
      organiserId: session.user.id,
      name: data.name,
      slug,
      eventType: data.eventType,
      location: data.location || null,
      description: data.description || null,
      startsAt,
      endsAt,
      status: EventStatus.ACTIVE,
    },
    select: { id: true },
  });

  auditLog("event.created", {
    userId: session.user.id,
    eventId: event.id,
  });

  revalidatePath("/");
  revalidatePath("/events");

  return { success: true, eventId: event.id };
}

export async function updateEvent(
  eventId: string,
  input: UpdateEventInput,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = updateEventSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const owned = await getOwnedEventOrNotFound(eventId, session.user.id);

  if (owned.status === EventStatus.ARCHIVED) {
    return {
      success: false,
      error: "Archived events cannot be edited. Restore is not available yet.",
    };
  }

  const data = parsed.data;
  const { startsAt, endsAt } = parseEventDates(data);

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: data.name,
      eventType: data.eventType,
      location: data.location || null,
      description: data.description || null,
      startsAt,
      endsAt,
      status: data.status,
    },
  });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);

  return { success: true };
}

export async function archiveEvent(eventId: string): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await getOwnedEventOrNotFound(eventId, session.user.id);

  await prisma.event.update({
    where: { id: eventId },
    data: { status: EventStatus.ARCHIVED },
  });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);

  auditLog("event.archived", {
    userId: session.user.id,
    eventId,
  });

  return { success: true };
}

export async function duplicateEvent(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = duplicateEventSchema.safeParse(input ?? {});

  if (!parsed.success) {
    return { success: false, error: "Invalid duplication options." };
  }

  const source = await prisma.event.findFirst({
    where: { id: eventId, organiserId: session.user.id },
    include: {
      activities: { orderBy: { sortOrder: "asc" } },
      guests: true,
      paymentItems: {
        include: { allocations: true },
      },
      posts: {
        where: { status: PostStatus.ACTIVE },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!source) {
    notFound();
  }

  const slug = await generateUniqueEventSlug(`${source.name} copy`);
  const copyAnnouncements = parsed.data.copyAnnouncements;

  const newEvent = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        organiserId: session.user.id,
        name: `${source.name} (copy)`,
        slug,
        eventType: source.eventType,
        location: source.location,
        description: source.description,
        startsAt: source.startsAt,
        endsAt: source.endsAt,
        paymentInstructions: source.paymentInstructions,
        status: EventStatus.DRAFT,
      },
    });

    const activityIdMap = new Map<string, string>();
    for (const activity of source.activities) {
      const created = await tx.activity.create({
        data: {
          eventId: event.id,
          title: activity.title,
          description: activity.description,
          location: activity.location,
          startsAt: activity.startsAt,
          endsAt: activity.endsAt,
          costCents: activity.costCents,
          status: activity.status,
          sortOrder: activity.sortOrder,
        },
      });
      activityIdMap.set(activity.id, created.id);
    }

    const guestIdMap = new Map<string, string>();
    for (const guest of source.guests) {
      if (guest.status === GuestStatus.ARCHIVED) {
        continue;
      }

      const inviteToken = await generateUniqueInviteToken();
      const created = await tx.eventGuest.create({
        data: {
          eventId: event.id,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          inviteToken,
          status: GuestStatus.INVITED,
        },
      });
      guestIdMap.set(guest.id, created.id);
    }

    for (const item of source.paymentItems) {
      const newActivityId = item.activityId
        ? activityIdMap.get(item.activityId) ?? null
        : null;

      const paymentItem = await tx.paymentItem.create({
        data: {
          eventId: event.id,
          activityId: newActivityId,
          title: item.title,
          description: item.description,
          amountCents: item.amountCents,
          status: item.status,
        },
      });

      for (const allocation of item.allocations) {
        const newGuestId = guestIdMap.get(allocation.guestId);
        if (!newGuestId) continue;

        await tx.paymentAllocation.create({
          data: {
            paymentItemId: paymentItem.id,
            guestId: newGuestId,
            amountCents: allocation.amountCents,
            amountPaidCents: 0,
            status: PaymentStatus.PENDING,
          },
        });
      }
    }

    if (copyAnnouncements) {
      for (const post of source.posts) {
        await tx.post.create({
          data: {
            eventId: event.id,
            authorUserId: session.user.id,
            type: post.type,
            content: post.content,
            pinned: post.pinned,
            status: PostStatus.ACTIVE,
          },
        });
      }
    }

    return event;
  });

  auditLog("event.duplicated", {
    userId: session.user.id,
    sourceEventId: eventId,
    newEventId: newEvent.id,
    copyAnnouncements,
  });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${newEvent.id}`);

  return { success: true, eventId: newEvent.id };
}
