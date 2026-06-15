"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { EventStatus, GuestStatus } from "@/generated/prisma/client";
import { assertEventOwned } from "@/lib/activities";
import { auditLog } from "@/lib/audit";
import { generateUniqueInviteToken } from "@/lib/guests/invite-token";
import { recalculateEventPayments } from "@/lib/payments/recalculate-event-payments";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  createGuestSchema,
  updateGuestSchema,
  type CreateGuestInput,
  type UpdateGuestInput,
} from "@/lib/validations/guest";

type GuestActionResult =
  | { success: true; guestId: string }
  | { success: false; error: string };

type SimpleResult =
  | { success: true }
  | { success: false; error: string };

type RegenerateResult =
  | { success: true; inviteToken: string }
  | { success: false; error: string };

async function getOwnedGuestOrNotFound(
  eventId: string,
  guestId: string,
  organiserId: string,
) {
  const guest = await prisma.eventGuest.findFirst({
    where: {
      id: guestId,
      eventId,
      event: { organiserId },
    },
    select: { id: true, status: true },
  });

  if (!guest) {
    notFound();
  }

  return guest;
}

function revalidateGuestPaths(eventId: string, guestId?: string) {
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/guests`);
  if (guestId) {
    revalidatePath(`/events/${eventId}/guests/${guestId}`);
    revalidatePath(`/events/${eventId}/guests/${guestId}/edit`);
  }
}

export async function createGuest(
  eventId: string,
  input: CreateGuestInput,
): Promise<GuestActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = createGuestSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot add guests to an archived event.",
    };
  }

  const data = parsed.data;
  const inviteToken = await generateUniqueInviteToken();

  const guest = await prisma.eventGuest.create({
    data: {
      eventId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      inviteToken,
      status: GuestStatus.INVITED,
    },
    select: { id: true },
  });

  await recalculateEventPayments(eventId);

  revalidateGuestPaths(eventId, guest.id);
  revalidatePath(`/events/${eventId}/payments`);

  auditLog("guest.created", {
    userId: session.user.id,
    eventId,
    guestId: guest.id,
  });

  return { success: true, guestId: guest.id };
}

export async function updateGuest(
  eventId: string,
  guestId: string,
  input: UpdateGuestInput,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = updateGuestSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  await assertEventOwned(eventId, session.user.id);
  const owned = await getOwnedGuestOrNotFound(
    eventId,
    guestId,
    session.user.id,
  );

  if (owned.status === GuestStatus.ARCHIVED) {
    return {
      success: false,
      error: "Archived guests cannot be edited.",
    };
  }

  const data = parsed.data;

  await prisma.eventGuest.update({
    where: { id: guestId },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
    },
  });

  revalidateGuestPaths(eventId, guestId);

  return { success: true };
}

export async function archiveGuest(
  eventId: string,
  guestId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  await getOwnedGuestOrNotFound(eventId, guestId, session.user.id);

  await prisma.eventGuest.update({
    where: { id: guestId },
    data: { status: GuestStatus.ARCHIVED },
  });

  await recalculateEventPayments(eventId);

  revalidateGuestPaths(eventId, guestId);
  revalidatePath(`/events/${eventId}/payments`);

  return { success: true };
}

export async function setGuestOfHonour(
  eventId: string,
  guestId: string,
  isGuestOfHonour: boolean,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const owned = await getOwnedGuestOrNotFound(
    eventId,
    guestId,
    session.user.id,
  );

  if (owned.status === GuestStatus.ARCHIVED) {
    return {
      success: false,
      error: "Archived guests cannot be marked as guest of honour.",
    };
  }

  await prisma.eventGuest.update({
    where: { id: guestId },
    data: { isGuestOfHonour },
  });

  await recalculateEventPayments(eventId);

  revalidateGuestPaths(eventId, guestId);
  revalidatePath(`/events/${eventId}/payments`);

  auditLog("guest.honour_updated", {
    userId: session.user.id,
    eventId,
    guestId,
    isGuestOfHonour,
  });

  return { success: true };
}

export async function regenerateGuestInviteToken(
  eventId: string,
  guestId: string,
): Promise<RegenerateResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const owned = await getOwnedGuestOrNotFound(
    eventId,
    guestId,
    session.user.id,
  );

  if (owned.status === GuestStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot regenerate invite link for an archived guest.",
    };
  }

  const inviteToken = await generateUniqueInviteToken();

  await prisma.eventGuest.update({
    where: { id: guestId },
    data: {
      inviteToken,
      inviteTokenExpiresAt: null,
    },
  });

  revalidateGuestPaths(eventId, guestId);

  auditLog("guest.invite_regenerated", {
    userId: session.user.id,
    eventId,
    guestId,
  });

  return { success: true, inviteToken };
}

export async function expireGuestInviteLink(
  eventId: string,
  guestId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const owned = await getOwnedGuestOrNotFound(
    eventId,
    guestId,
    session.user.id,
  );

  if (owned.status === GuestStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot expire invite for an archived guest.",
    };
  }

  await prisma.eventGuest.update({
    where: { id: guestId },
    data: { inviteTokenExpiresAt: new Date() },
  });

  revalidateGuestPaths(eventId, guestId);

  auditLog("guest.invite_expired", {
    userId: session.user.id,
    eventId,
    guestId,
  });

  return { success: true };
}

export async function reactivateGuestInviteLink(
  eventId: string,
  guestId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const owned = await getOwnedGuestOrNotFound(
    eventId,
    guestId,
    session.user.id,
  );

  if (owned.status === GuestStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot reactivate invite for an archived guest.",
    };
  }

  await prisma.eventGuest.update({
    where: { id: guestId },
    data: { inviteTokenExpiresAt: null },
  });

  revalidateGuestPaths(eventId, guestId);

  auditLog("guest.invite_reactivated", {
    userId: session.user.id,
    eventId,
    guestId,
  });

  return { success: true };
}
