import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { OrganiserPhotosSection } from "@/components/photos/organiser-photos-section";
import { getOrganiserEvent } from "@/lib/events";
import { getOrganiserEventPhotos } from "@/lib/photos";

export default async function EventPhotosPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, photos] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserEventPhotos(eventId),
  ]);

  const canUpload = event.status !== EventStatus.ARCHIVED;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`/events/${eventId}/feed`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to updates
      </Link>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-primary">{event.name}</p>
        <h2 className="mt-1 font-heading text-xl font-semibold">Photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Private gallery for this event — stored securely, not public.
        </p>
      </div>

      <OrganiserPhotosSection
        eventId={eventId}
        photos={photos}
        canUpload={canUpload}
      />
    </main>
  );
}
