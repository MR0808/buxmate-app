"use server";

import { revalidatePath } from "next/cache";
import {
  EventStatus,
  GuestStatus,
} from "@/generated/prisma/client";
import { assertEventOwned } from "@/lib/activities";
import { generateUniqueInviteToken } from "@/lib/guests/invite-token";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  bulkGuestIdsSchema,
  importGuestsSchema,
} from "@/lib/validations/guest-bulk";
import { createGuestSchema } from "@/lib/validations/guest";

type BulkResult =
  | { success: true; processed: number; skipped: number }
  | { success: false; error: string };

type ImportResult =
  | { success: true; imported: number; skipped: number }
  | { success: false; error: string };

async function getOwnedGuestsByIds(
  eventId: string,
  organiserId: string,
  guestIds: string[],
) {
  const uniqueIds = [...new Set(guestIds)];
  const guests = await prisma.eventGuest.findMany({
    where: {
      id: { in: uniqueIds },
      eventId,
      event: { organiserId },
    },
    select: { id: true, status: true },
  });

  if (guests.length !== uniqueIds.length) {
    return null;
  }

  return guests;
}

function revalidateGuestList(eventId: string) {
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/guests`);
}

export async function bulkArchiveGuests(
  eventId: string,
  guestIds: string[],
): Promise<BulkResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);

  const parsed = bulkGuestIdsSchema.safeParse(guestIds);
  if (!parsed.success) {
    return { success: false, error: "Select at least one guest." };
  }

  const guests = await getOwnedGuestsByIds(
    eventId,
    session.user.id,
    parsed.data,
  );
  if (!guests) {
    return { success: false, error: "Some selected guests were not found." };
  }

  const toArchive = guests.filter(
    (guest) => guest.status !== GuestStatus.ARCHIVED,
  );

  if (toArchive.length === 0) {
    return { success: false, error: "Selected guests are already archived." };
  }

  await prisma.eventGuest.updateMany({
    where: { id: { in: toArchive.map((guest) => guest.id) } },
    data: { status: GuestStatus.ARCHIVED },
  });

  revalidateGuestList(eventId);

  return {
    success: true,
    processed: toArchive.length,
    skipped: guests.length - toArchive.length,
  };
}

export async function importGuests(
  eventId: string,
  rows: unknown[],
): Promise<ImportResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot import guests to an archived event.",
    };
  }

  const validatedRows = [];
  for (const row of rows) {
    const parsed = createGuestSchema.safeParse(row);
    if (parsed.success) {
      validatedRows.push(parsed.data);
    }
  }

  const parsed = importGuestsSchema.safeParse(validatedRows);
  if (!parsed.success) {
    return {
      success: false,
      error: "No valid guests to import. Check your CSV and try again.",
    };
  }

  let imported = 0;
  for (const data of parsed.data) {
    const inviteToken = await generateUniqueInviteToken();
    await prisma.eventGuest.create({
      data: {
        eventId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        inviteToken,
        status: GuestStatus.INVITED,
      },
    });
    imported += 1;
  }

  revalidateGuestList(eventId);

  return {
    success: true,
    imported,
    skipped: rows.length - imported,
  };
}
