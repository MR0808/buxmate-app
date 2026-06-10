import { PhotoStatus } from "@/generated/prisma/client";
import { getSignedPhotoUrls } from "@/lib/photos/storage";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";

const photoListSelect = {
  id: true,
  storagePath: true,
  caption: true,
  createdAt: true,
  uploadedByUserId: true,
  uploadedByGuestId: true,
  uploadedByUser: { select: { name: true } },
  uploadedByGuest: { select: { id: true, name: true } },
} as const;

type PhotoRow = {
  id: string;
  storagePath: string;
  caption: string | null;
  createdAt: Date;
  uploadedByUserId: string | null;
  uploadedByGuestId: string | null;
  uploadedByUser: { name: string } | null;
  uploadedByGuest: { id: string; name: string } | null;
};

export type EventPhotoItem = {
  id: string;
  signedUrl: string;
  caption: string | null;
  createdAt: Date;
  uploaderName: string;
  uploadedByGuestId: string | null;
  uploadedByUserId: string | null;
};

async function attachSignedUrls(photos: PhotoRow[]): Promise<EventPhotoItem[]> {
  const signedUrls = await getSignedPhotoUrls(photos.map((photo) => photo.storagePath));

  return photos
    .map((photo) => {
      const signedUrl = signedUrls.get(photo.storagePath);
      if (!signedUrl) {
        return null;
      }

      const uploaderName =
        photo.uploadedByUser?.name ??
        photo.uploadedByGuest?.name ??
        "Someone";

      return {
        id: photo.id,
        signedUrl,
        caption: photo.caption,
        createdAt: photo.createdAt,
        uploaderName,
        uploadedByGuestId: photo.uploadedByGuestId,
        uploadedByUserId: photo.uploadedByUserId,
      };
    })
    .filter((photo): photo is EventPhotoItem => photo !== null);
}

export async function getOrganiserEventPhotos(eventId: string) {
  const session = await requireVerifiedOrganiser();

  const photos = await prisma.photo.findMany({
    where: {
      eventId,
      status: PhotoStatus.ACTIVE,
      event: { organiserId: session.user.id },
    },
    orderBy: { createdAt: "desc" },
    select: photoListSelect,
  });

  return attachSignedUrls(photos);
}

export async function getGuestEventPhotos(eventId: string) {
  const photos = await prisma.photo.findMany({
    where: {
      eventId,
      status: PhotoStatus.ACTIVE,
    },
    orderBy: { createdAt: "desc" },
    select: photoListSelect,
  });

  return attachSignedUrls(photos);
}

export async function getOrganiserPhotoCount(eventId: string) {
  const session = await requireVerifiedOrganiser();

  return prisma.photo.count({
    where: {
      eventId,
      status: PhotoStatus.ACTIVE,
      event: { organiserId: session.user.id },
    },
  });
}
