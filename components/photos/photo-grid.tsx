import { PhotoDeleteButton } from "@/components/photos/photo-delete-button";
import { formatPostDateTime } from "@/lib/posts/format";
import type { EventPhotoItem } from "@/lib/photos";

type PhotoGridProps = {
  photos: EventPhotoItem[];
  mode: "organiser" | "guest";
  eventId?: string;
  eventSlug?: string;
  guestId?: string;
  canManage?: boolean;
};

export function PhotoGrid({
  photos,
  mode,
  eventId,
  eventSlug,
  guestId,
  canManage = true,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {photos.map((photo) => {
        const canDelete =
          canManage &&
          (mode === "organiser" ||
            (guestId && photo.uploadedByGuestId === guestId));

        return (
          <figure
            key={photo.id}
            className="buxmate-card overflow-hidden"
          >
            <div className="aspect-square bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.signedUrl}
                alt={photo.caption ?? `Photo from ${photo.uploaderName}`}
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
            <figcaption className="space-y-2 p-3">
              {photo.caption ? (
                <p className="text-sm leading-snug">{photo.caption}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {photo.uploaderName} · {formatPostDateTime(photo.createdAt)}
              </p>
              {canDelete ? (
                <PhotoDeleteButton
                  mode={mode}
                  photoId={photo.id}
                  eventId={eventId}
                  eventSlug={eventSlug}
                />
              ) : null}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
