import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";
import { ActivityStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ArchiveActivitySection } from "@/components/activities/archive-activity-section";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import {
  formatActivityCost,
  formatActivityTimeRange,
} from "@/lib/activities/format";
import { RsvpCountsDisplay } from "@/components/organiser/rsvp-counts";
import { getOrganiserActivity } from "@/lib/activities";
import { getOrganiserEvent } from "@/lib/events";
import { getRsvpCountsForActivity } from "@/lib/rsvp";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; activityId: string }>;
}) {
  const { eventId, activityId } = await params;
  const [event, activity, rsvpCounts] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserActivity(eventId, activityId),
    getRsvpCountsForActivity(activityId),
  ]);

  const isArchived = activity.status === ActivityStatus.ARCHIVED;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/events/${eventId}/activities`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Activities
          </Link>
          <p className="mt-2 text-xs uppercase tracking-wider text-primary">
            {event.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
              {activity.title}
            </h1>
            <ActivityStatusBadge status={activity.status} />
          </div>
        </div>
        {!isArchived ? (
          <Button
            variant="outline"
            className="shrink-0 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={`/events/${eventId}/activities/${activityId}/edit`}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </Link>
          </Button>
        ) : null}
      </div>

      <section className="buxmate-card p-6 sm:p-8">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              When
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatActivityTimeRange(activity.startsAt, activity.endsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Cost
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatActivityCost(activity.costCents)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Location
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              {activity.location ? (
                <>
                  <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                  {activity.location}
                </>
              ) : (
                "Not set"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Description
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {activity.description?.trim()
                ? activity.description
                : "No description."}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <h3 className="text-sm font-semibold">RSVPs</h3>
          <div className="mt-2">
            <RsvpCountsDisplay counts={rsvpCounts} />
          </div>
        </div>
      </section>

      <section className="buxmate-card mt-6 p-6">
        <h2 className="font-heading text-lg font-semibold">Archive</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Remove this activity from the active itinerary without deleting its
          record.
        </p>
        <div className="mt-4">
          <ArchiveActivitySection
            eventId={eventId}
            activityId={activityId}
            activityName={activity.title}
            status={activity.status}
          />
        </div>
      </section>
    </main>
  );
}
