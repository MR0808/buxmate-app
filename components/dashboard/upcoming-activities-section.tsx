import { ListTodo } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EventTimeline } from "@/components/events/event-timeline";
import type { DashboardUpcomingActivity } from "@/lib/event-dashboard";

type UpcomingActivitiesSectionProps = {
  eventId: string;
  activities: DashboardUpcomingActivity[];
  canManage: boolean;
};

function RsvpSummary({ rsvp }: { rsvp: DashboardUpcomingActivity["rsvp"] }) {
  if (rsvp.total === 0) {
    return (
      <span className="text-xs text-muted-foreground">No RSVPs yet</span>
    );
  }

  const parts = [
    rsvp.going > 0 ? `${rsvp.going} going` : null,
    rsvp.maybe > 0 ? `${rsvp.maybe} maybe` : null,
    rsvp.notGoing > 0 ? `${rsvp.notGoing} can't make it` : null,
    rsvp.pending > 0 ? `${rsvp.pending} pending` : null,
  ].filter(Boolean);

  return (
    <span className="text-xs text-muted-foreground">{parts.join(" · ")}</span>
  );
}

export function UpcomingActivitiesSection({
  eventId,
  activities,
  canManage,
}: UpcomingActivitiesSectionProps) {
  const basePath = `/events/${eventId}`;

  return (
    <DashboardSection
      title="Event timeline"
      description="What's coming up on the itinerary."
      action={
        activities.length > 0
          ? { label: "View full timeline", href: `${basePath}/activities` }
          : undefined
      }
      empty={
        activities.length === 0
          ? {
              icon: ListTodo,
              title: "No activities yet",
              description: "Add the first activity and start building your itinerary.",
              action: canManage
                ? { label: "Add activity", href: `${basePath}/activities/new` }
                : undefined,
            }
          : undefined
      }
    >
      {activities.length > 0 ? (
        <EventTimeline
          activities={activities}
          getActivityHref={(activity) =>
            `${basePath}/activities/${activity.id}`
          }
          renderActivity={(activity) => (
            <div className="pb-5 last:pb-0">
              <p className="text-sm font-medium text-primary">
                {activity.timeLabel} — {activity.title}
              </p>
              {activity.location ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {activity.location}
                </p>
              ) : null}
              <p className="mt-2">
                <RsvpSummary rsvp={activity.rsvp} />
              </p>
            </div>
          )}
        />
      ) : null}
    </DashboardSection>
  );
}
