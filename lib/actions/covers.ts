"use server";

import { revalidatePath } from "next/cache";
import { EventStatus } from "@/generated/prisma/client";
import { assertEventOwned } from "@/lib/activities";
import {
  buildCoverStoragePath,
  deleteCoverFromStorage,
  isCoverStoragePathForEvent,
  uploadCoverToStorage,
} from "@/lib/covers/storage";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import { validateCoverFile } from "@/lib/validations/cover";

type CoverActionResult =
  | { success: true }
  | { success: false; error: string };

export async function uploadEventCover(
  eventId: string,
  formData: FormData,
): Promise<CoverActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot update an archived event." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose an image to upload." };
  }

  const validated = validateCoverFile(file);
  if (!validated.success) {
    return { success: false, error: validated.error };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = buildCoverStoragePath(eventId, file.name);

  if (event.coverPath && isCoverStoragePathForEvent(event.coverPath, eventId)) {
    await deleteCoverFromStorage(event.coverPath);
  }

  const uploaded = await uploadCoverToStorage(
    storagePath,
    buffer,
    validated.mimeType,
  );
  if (!uploaded.success) {
    return uploaded;
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { coverPath: storagePath },
  });

  const slug = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);
  revalidatePath("/events");
  revalidatePath("/");
  if (slug?.slug) {
    revalidatePath(`/e/${slug.slug}`);
  }

  return { success: true };
}

export async function removeEventCover(eventId: string): Promise<CoverActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return { success: false, error: "Cannot update an archived event." };
  }

  if (!event.coverPath) {
    return { success: true };
  }

  if (isCoverStoragePathForEvent(event.coverPath, eventId)) {
    await deleteCoverFromStorage(event.coverPath);
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { coverPath: null },
  });

  const slug = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);
  revalidatePath("/events");
  revalidatePath("/");
  if (slug?.slug) {
    revalidatePath(`/e/${slug.slug}`);
  }

  return { success: true };
}
