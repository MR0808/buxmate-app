"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { randomUUID } from "crypto";
import {
  EventStatus,
  PhotoStatus,
  PostStatus,
  PostType,
} from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";
import { assertEventOwned } from "@/lib/activities";
import { getVerifiedGuestForSession } from "@/lib/guest-access";
import {
  buildPhotoStoragePath,
  deletePhotoFromStorage,
  isPhotoStoragePathForEvent,
  uploadPhotoToStorage,
} from "@/lib/photos/storage";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  parsePhotoCaption,
  validatePhotoFile,
} from "@/lib/validations/photo";

type ActionResult =
  | { success: true; photoId: string }
  | { success: false; error: string };

type SimpleResult =
  | { success: true }
  | { success: false; error: string };

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

async function revalidatePhotoPaths(eventId: string, eventSlug?: string) {
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/feed`);
  revalidatePath(`/events/${eventId}/photos`);
  if (eventSlug) {
    revalidatePath(`/e/${eventSlug}`);
  } else {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { slug: true },
    });
    if (event?.slug) {
      revalidatePath(`/e/${event.slug}`);
    }
  }
}

async function createPhotoFeedPost(
  eventId: string,
  photoId: string,
  authorUserId: string | null,
  authorGuestId: string | null,
  displayName: string,
) {
  const post = await prisma.post.create({
    data: {
      eventId,
      authorUserId,
      authorGuestId,
      type: PostType.UPDATE,
      content: `${firstName(displayName)} added a photo.`,
      status: PostStatus.ACTIVE,
    },
    select: { id: true },
  });

  await prisma.photo.update({
    where: { id: photoId },
    data: { postId: post.id },
  });
}

async function uploadPhotoForEvent({
  eventId,
  file,
  caption,
  uploadedByUserId,
  uploadedByGuestId,
  authorDisplayName,
}: {
  eventId: string;
  file: File;
  caption: string | null;
  uploadedByUserId: string | null;
  uploadedByGuestId: string | null;
  authorDisplayName: string;
}): Promise<ActionResult> {
  const validated = validatePhotoFile(file);
  if (!validated.success) {
    return { success: false, error: validated.error };
  }

  const photoId = randomUUID();
  const storagePath = buildPhotoStoragePath(
    eventId,
    photoId,
    file.name || "photo.jpg",
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await uploadPhotoToStorage(
    storagePath,
    buffer,
    validated.mimeType,
  );

  if (!upload.success) {
    return { success: false, error: upload.error };
  }

  try {
    await prisma.photo.create({
      data: {
        id: photoId,
        eventId,
        uploadedByUserId,
        uploadedByGuestId,
        storagePath,
        originalFilename: file.name || "photo.jpg",
        mimeType: validated.mimeType,
        sizeBytes: file.size,
        caption,
        status: PhotoStatus.ACTIVE,
      },
    });

    await createPhotoFeedPost(
      eventId,
      photoId,
      uploadedByUserId,
      uploadedByGuestId,
      authorDisplayName,
    );
  } catch {
    await deletePhotoFromStorage(storagePath);
    return {
      success: false,
      error: "Could not save photo. Please try again.",
    };
  }

  return { success: true, photoId };
}

export async function uploadOrganiserPhoto(
  eventId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot upload photos to an archived event.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose a photo to upload." };
  }

  const captionResult = parsePhotoCaption(formData.get("caption"));
  if (!captionResult.success) {
    return { success: false, error: captionResult.error };
  }

  const result = await uploadPhotoForEvent({
    eventId,
    file,
    caption: captionResult.caption,
    uploadedByUserId: session.user.id,
    uploadedByGuestId: null,
    authorDisplayName: session.user.name,
  });

  if (result.success) {
    auditLog("photo.uploaded", {
      userId: session.user.id,
      eventId,
      photoId: result.photoId,
      role: "organiser",
    });
    await revalidatePhotoPaths(eventId);
  }

  return result;
}

export async function uploadGuestPhoto(
  eventSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const guest = await getVerifiedGuestForSession(eventSlug);
  if (!guest) {
    return {
      success: false,
      error: "Your session has expired. Open your invite link again.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose a photo to upload." };
  }

  const captionResult = parsePhotoCaption(formData.get("caption"));
  if (!captionResult.success) {
    return { success: false, error: captionResult.error };
  }

  const guestProfile = await prisma.eventGuest.findUnique({
    where: { id: guest.id },
    select: { name: true },
  });

  if (!guestProfile) {
    return { success: false, error: "Guest profile not found." };
  }

  const result = await uploadPhotoForEvent({
    eventId: guest.eventId,
    file,
    caption: captionResult.caption,
    uploadedByUserId: null,
    uploadedByGuestId: guest.id,
    authorDisplayName: guestProfile.name,
  });

  if (result.success) {
    await revalidatePhotoPaths(guest.eventId, eventSlug);
  }

  return result;
}

async function getOwnedPhotoOrNotFound(
  eventId: string,
  photoId: string,
  organiserId: string,
) {
  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
      eventId,
      event: { organiserId },
    },
    select: {
      id: true,
      storagePath: true,
      status: true,
      postId: true,
    },
  });

  if (!photo) {
    notFound();
  }

  return photo;
}

async function archivePhotoRecord(
  eventId: string,
  photo: {
    id: string;
    storagePath: string;
    postId: string | null;
  },
) {
  if (!isPhotoStoragePathForEvent(photo.storagePath, eventId)) {
    throw new Error("Invalid photo storage path");
  }

  await prisma.photo.update({
    where: { id: photo.id },
    data: { status: PhotoStatus.ARCHIVED },
  });

  if (photo.postId) {
    await prisma.post.updateMany({
      where: { id: photo.postId },
      data: {
        status: PostStatus.ARCHIVED,
        pinned: false,
      },
    });
  }

  await deletePhotoFromStorage(photo.storagePath);
}

export async function archiveOrganiserPhoto(
  eventId: string,
  photoId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const photo = await getOwnedPhotoOrNotFound(eventId, photoId, session.user.id);

  if (photo.status === PhotoStatus.ARCHIVED) {
    return { success: true };
  }

  if (!isPhotoStoragePathForEvent(photo.storagePath, eventId)) {
    return { success: false, error: "Invalid photo path." };
  }

  await archivePhotoRecord(eventId, photo);
  await revalidatePhotoPaths(eventId);

  return { success: true };
}

export async function archiveGuestPhoto(
  eventSlug: string,
  photoId: string,
): Promise<SimpleResult> {
  const guest = await getVerifiedGuestForSession(eventSlug);
  if (!guest) {
    return {
      success: false,
      error: "Your session has expired. Open your invite link again.",
    };
  }

  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
      eventId: guest.eventId,
      uploadedByGuestId: guest.id,
      status: PhotoStatus.ACTIVE,
    },
    select: {
      id: true,
      storagePath: true,
      postId: true,
    },
  });

  if (!photo) {
    return { success: false, error: "You can only remove photos you uploaded." };
  }

  if (!isPhotoStoragePathForEvent(photo.storagePath, guest.eventId)) {
    return { success: false, error: "Invalid photo path." };
  }

  await archivePhotoRecord(guest.eventId, photo);
  await revalidatePhotoPaths(guest.eventId, eventSlug);

  return { success: true };
}
