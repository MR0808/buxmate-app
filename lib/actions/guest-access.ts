"use server";

import { revalidatePath } from "next/cache";
import {
  ActivityStatus,
  EventStatus,
  GuestStatus,
  RsvpStatus,
} from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";
import {
  getVerifiedGuestForSession,
  validateInviteForJoin,
} from "@/lib/guest-access";
import { setGuestSessionCookie } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { guestFieldsSchema, type CreateGuestInput } from "@/lib/validations/guest";
import { z } from "zod";

const rsvpStatusSchema = z.enum([
  RsvpStatus.GOING,
  RsvpStatus.MAYBE,
  RsvpStatus.NOT_GOING,
]);

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function joinEventAsGuest(
  inviteToken: string,
  input: CreateGuestInput,
): Promise<
  | { success: true; eventSlug: string }
  | { success: false; error: string }
> {
  const parsed = guestFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Please check the form and try again." };
  }

  const invite = await validateInviteForJoin(inviteToken);
  if (!invite) {
    return { success: false as const, error: "This invite link is not valid." };
  }

  if ("invalid" in invite) {
    return {
      success: false as const,
      error: "This invite link is no longer available.",
    };
  }

  const data = parsed.data;

  await prisma.eventGuest.update({
    where: { id: invite.guest.id },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      status: GuestStatus.JOINED,
      lastAccessedAt: new Date(),
    },
  });

  await setGuestSessionCookie(invite.guest.id, invite.guest.event.slug);

  auditLog("guest.joined", {
    guestId: invite.guest.id,
    eventId: invite.guest.event.id,
  });

  revalidatePath(`/e/${invite.guest.event.slug}`);
  return { success: true, eventSlug: invite.guest.event.slug };
}

export async function updateGuestDetails(
  input: CreateGuestInput,
): Promise<ActionResult> {
  const parsed = guestFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const guest = await getVerifiedGuestForSession();
  if (!guest) {
    return { success: false, error: "Your session has expired. Open your invite link again." };
  }

  const data = parsed.data;

  await prisma.eventGuest.update({
    where: { id: guest.id },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      lastAccessedAt: new Date(),
    },
  });

  revalidatePath(`/e/${guest.event.slug}`);

  return { success: true };
}

export async function submitActivityRsvp(
  eventSlug: string,
  activityId: string,
  status: "GOING" | "MAYBE" | "NOT_GOING",
): Promise<ActionResult> {
  const parsedStatus = rsvpStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, error: "Invalid RSVP choice." };
  }

  const guest = await getVerifiedGuestForSession(eventSlug);
  if (!guest) {
    return {
      success: false,
      error: "Your session has expired. Open your invite link again.",
    };
  }

  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      eventId: guest.eventId,
      status: ActivityStatus.ACTIVE,
      event: { status: { not: EventStatus.ARCHIVED } },
    },
    select: { id: true },
  });

  if (!activity) {
    return { success: false, error: "This activity is not available." };
  }

  await prisma.activityRsvp.upsert({
    where: {
      activityId_guestId: {
        activityId,
        guestId: guest.id,
      },
    },
    create: {
      activityId,
      guestId: guest.id,
      status: parsedStatus.data,
    },
    update: {
      status: parsedStatus.data,
    },
  });

  await prisma.eventGuest.update({
    where: { id: guest.id },
    data: { lastAccessedAt: new Date() },
  });

  revalidatePath(`/e/${eventSlug}`);
  revalidatePath(`/events/${guest.eventId}`);
  revalidatePath(`/events/${guest.eventId}/activities`);
  revalidatePath(`/events/${guest.eventId}/activities/${activityId}`);
  revalidatePath(`/events/${guest.eventId}/guests`);

  auditLog("rsvp.submitted", {
    guestId: guest.id,
    eventId: guest.eventId,
    activityId,
    status: parsedStatus.data,
  });

  return { success: true };
}
