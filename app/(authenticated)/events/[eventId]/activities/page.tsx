import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { ActivityStatus, EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { EventTimeline } from "@/components/events/event-timeline";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import {
  formatActivityCost,
} from "@/lib/activities/format";
import { RsvpCountsDisplay } from "@/components/organiser/rsvp-counts";
import { getOrganiserActivities } from "@/lib/activities";
import { SendRsvpReminderButton } from "@/components/emails/send-rsvp-reminder-button";
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
          <h2 className="mt-1 font-heading text-xl font-semibold">Timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeActivities.length} active
            {activities.length !== activeActivities.length
              ? ` · ${activities.length} total`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAdd && activeActivities.length > 0 ? (
            <SendRsvpReminderButton eventId={eventId} />
          ) : null}
          {canAdd ? (
            <Button className="rounded-full normal-case tracking-normal" asChild>
              <Link href={`/events/${eventId}/activities/new`}>
                <Plus className="size-4" aria-hidden />
                Add activity
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        {activeActivities.length > 0 ? (
          <EventTimeline
            activities={activeActivities}
            getActivityHref={(activity) =>
              `/events/${eventId}/activities/${activity.id}`
            }
            renderActivity={(activity) => (
              <div className="pb-6 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-primary">
                    {activity.timeLabel} — {activity.title}
                  </p>
                  <ActivityStatusBadge status={ActivityStatus.ACTIVE} />
                </div>
                {activity.location ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activity.location}
                  </p>
                ) : null}
                <p className="mt-1 text-sm font-medium">
                  {formatActivityCost(activity.costCents)}
                </p>
                <div className="mt-2">
                  <RsvpCountsDisplay
                    counts={
                      rsvpCountsByActivity.get(activity.id) ??
                      emptyRsvpCounts()
                    }
                    compact
                  />
                </div>
                <Link
                  href={`/events/${eventId}/activities/${activity.id}`}
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  View details →
                </Link>
              </div>
            )}
          />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No activities yet"
            description="Add the first activity and start building your itinerary."
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

        {activities.some((a) => a.status !== ActivityStatus.ACTIVE) ? (
          <section className="mt-10">
            <h3 className="font-heading text-lg font-semibold">Archived</h3>
            <div className="mt-4 space-y-3">
              {activities
                .filter((a) => a.status !== ActivityStatus.ACTIVE)
                .map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/events/${eventId}/activities/${activity.id}`}
                    className="buxmate-card block p-4 text-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <ActivityStatusBadge status={activity.status} />
                      <span className="font-medium">{activity.title}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
