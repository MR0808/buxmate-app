"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { EventStatus } from "@/generated/prisma/client";
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

  return { success: true };
}
