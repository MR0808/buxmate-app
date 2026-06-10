import { Camera } from "lucide-react";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoUploadForm } from "@/components/photos/photo-upload-form";
import { EmptyState } from "@/components/shared/empty-state";
import type { EventPhotoItem } from "@/lib/photos";

type GuestPhotosSectionProps = {
  eventSlug: string;
  guestId: string;
  photos: EventPhotoItem[];
};

export function GuestPhotosSection({
  eventSlug,
  guestId,
  photos,
}: GuestPhotosSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">Photos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Shared memories — upload from your phone.
      </p>

      <div className="mt-4">
        <PhotoUploadForm mode="guest" eventSlug={eventSlug} />
      </div>

      {photos.length > 0 ? (
        <div className="mt-4">
          <PhotoGrid
            photos={photos}
            mode="guest"
            eventSlug={eventSlug}
            guestId={guestId}
          />
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          icon={Camera}
          title="No photos yet"
          description="Share the first memory. Only people on this event can see it."
        />
      )}
    </section>
  );
}
