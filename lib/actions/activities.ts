"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { ActivityStatus, EventStatus } from "@/generated/prisma/client";
import { assertEventOwned } from "@/lib/activities";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  createActivitySchema,
  dollarsToCents,
  parseActivityTimes,
  updateActivitySchema,
  type CreateActivityInput,
  type UpdateActivityInput,
} from "@/lib/validations/activity";

type ActionResult =
  | { success: true; activityId: string }
  | { success: false; error: string };

type SimpleResult =
  | { success: true }
  | { success: false; error: string };

async function getOwnedActivityOrNotFound(
  eventId: string,
  activityId: string,
  organiserId: string,
) {
  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      eventId,
      event: { organiserId },
    },
    select: { id: true, status: true },
  });

  if (!activity) {
    notFound();
  }

  return activity;
}

function revalidateActivityPaths(eventId: string, activityId?: string) {
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/activities`);
  if (activityId) {
    revalidatePath(`/events/${eventId}/activities/${activityId}`);
    revalidatePath(`/events/${eventId}/activities/${activityId}/edit`);
  }
}

export async function createActivity(
  eventId: string,
  input: CreateActivityInput,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = createActivitySchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot add activities to an archived event.",
    };
  }

  const data = parsed.data;
  const { startsAt, endsAt } = parseActivityTimes(data);

  const sortOrder = await prisma.activity.count({
    where: { eventId, status: ActivityStatus.ACTIVE },
  });

  const activity = await prisma.activity.create({
    data: {
      eventId,
      title: data.name,
      description: data.description || null,
      location: data.location || null,
      startsAt,
      endsAt,
      costCents: dollarsToCents(data.cost),
      sortOrder,
      status: ActivityStatus.ACTIVE,
    },
    select: { id: true },
  });

  revalidateActivityPaths(eventId, activity.id);

  return { success: true, activityId: activity.id };
}

export async function updateActivity(
  eventId: string,
  activityId: string,
  input: UpdateActivityInput,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = updateActivitySchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  await assertEventOwned(eventId, session.user.id);
  const owned = await getOwnedActivityOrNotFound(
    eventId,
    activityId,
    session.user.id,
  );

  if (owned.status === ActivityStatus.ARCHIVED) {
    return {
      success: false,
      error: "Archived activities cannot be edited.",
    };
  }

  const data = parsed.data;
  const { startsAt, endsAt } = parseActivityTimes(data);

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      title: data.name,
      description: data.description || null,
      location: data.location || null,
      startsAt,
      endsAt,
      costCents: dollarsToCents(data.cost),
    },
  });

  revalidateActivityPaths(eventId, activityId);

  return { success: true };
}

export async function archiveActivity(
  eventId: string,
  activityId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  await getOwnedActivityOrNotFound(eventId, activityId, session.user.id);

  await prisma.activity.update({
    where: { id: activityId },
    data: { status: ActivityStatus.ARCHIVED },
  });

  revalidateActivityPaths(eventId, activityId);

  return { success: true };
}
