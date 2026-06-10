import Link from "next/link";
import { Camera } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardPhotoPreview } from "@/lib/event-dashboard";

type RecentPhotosPreviewProps = {
  eventId: string;
  photos: DashboardPhotoPreview[];
  totalCount: number;
  canManage: boolean;
};

export function RecentPhotosPreview({
  eventId,
  photos,
  totalCount,
  canManage,
}: RecentPhotosPreviewProps) {
  const basePath = `/events/${eventId}`;

  return (
    <DashboardSection
      title="Recent photos"
      description="Shared memories from your event."
      action={
        totalCount > 0
          ? { label: "View gallery", href: `${basePath}/photos` }
          : undefined
      }
      empty={
        photos.length === 0
          ? {
              icon: Camera,
              title: "No photos yet",
              description: "Share the first memory from your event.",
              action: canManage
                ? { label: "Upload photo", href: `${basePath}/photos` }
                : undefined,
            }
          : undefined
      }
    >
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`${basePath}/photos`}
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.signedUrl}
                alt={photo.caption ?? "Event photo"}
                className="size-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      ) : null}
    </DashboardSection>
  );
}
