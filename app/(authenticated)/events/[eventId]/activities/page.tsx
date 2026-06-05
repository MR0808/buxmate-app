import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Plus } from "lucide-react";
import { ActivityStatus, EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import {
  formatActivityCost,
  formatActivityTimeRange,
} from "@/lib/activities/format";
import { RsvpCountsDisplay } from "@/components/organiser/rsvp-counts";
import { getOrganiserActivities } from "@/lib/activities";
import { getOrganiserEvent } from "@/lib/events";
import { getRsvpCountsForEventActivities, emptyRsvpCounts } from "@/lib/rsvp";

export default async function EventActivitiesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, activities] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserActivities(eventId),
  ]);
  const rsvpCountsByActivity = await getRsvpCountsForEventActivities(eventId);

  const activeActivities = activities.filter(
    (a) => a.status === ActivityStatus.ACTIVE,
  );
  const canAdd = event.status !== EventStatus.ARCHIVED;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            {event.name}
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold">Activities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeActivities.length} active
            {activities.length !== activeActivities.length
              ? ` · ${activities.length} total`
              : ""}
          </p>
        </div>
        {canAdd ? (
          <Button className="rounded-full normal-case tracking-normal" asChild>
            <Link href={`/events/${eventId}/activities/new`}>
              <Plus className="size-4" aria-hidden />
              Add activity
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-8">
        {activities.length > 0 ? (
          <div className="grid gap-4">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/events/${eventId}/activities/${activity.id}`}
                className="buxmate-card block p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ActivityStatusBadge status={activity.status} />
                    </div>
                    <h3 className="mt-2 font-heading text-lg font-semibold">
                      {activity.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatActivityTimeRange(activity.startsAt, activity.endsAt)}
                    </p>
                    {activity.location ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        {activity.location}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm font-medium">
                      {formatActivityCost(activity.costCents)}
                    </p>
                    <div className="mt-3">
                      <RsvpCountsDisplay
                        counts={
                          rsvpCountsByActivity.get(activity.id) ??
                          emptyRsvpCounts()
                        }
                        compact
                      />
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No activities yet"
            description="Add the first activity for this event."
            action={
              canAdd ? (
                <Button className="rounded-full normal-case tracking-normal" asChild>
                  <Link href={`/events/${eventId}/activities/new`}>
                    Add activity
                  </Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </main>
  );
}
