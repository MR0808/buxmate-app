import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoUploadForm } from "@/components/photos/photo-upload-form";
import type { EventPhotoItem } from "@/lib/photos";

type OrganiserPhotosSectionProps = {
  eventId: string;
  photos: EventPhotoItem[];
  canUpload: boolean;
  showViewAllLink?: boolean;
  compact?: boolean;
};

export function OrganiserPhotosSection({
  eventId,
  photos,
  canUpload,
  showViewAllLink = false,
  compact = false,
}: OrganiserPhotosSectionProps) {
  return (
    <section className={compact ? "" : "mt-10"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold">Photos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared memories — private to this event.
          </p>
        </div>
        {showViewAllLink && photos.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={`/events/${eventId}/photos`}>View all photos</Link>
          </Button>
        ) : null}
      </div>

      {canUpload ? (
        <div className="mt-4">
          <PhotoUploadForm
            mode="organiser"
            eventId={eventId}
            disabled={!canUpload}
            compact={compact}
          />
        </div>
      ) : null}

      {photos.length > 0 ? (
        <div className="mt-4">
          <PhotoGrid
            photos={photos}
            mode="organiser"
            eventId={eventId}
            canManage={canUpload}
          />
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          icon={Camera}
          title="No photos yet"
          description="Share the first memory from your event."
        />
      )}
    </section>
  );
}
