import { ListTodo } from "lucide-react";
import { ActivityRsvpCard } from "@/components/guest/activity-rsvp-card";
import { EventTimeline } from "@/components/events/event-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import type { GuestRsvpStatus } from "@/lib/rsvp-labels";

type GuestActivitiesSectionProps = {
  eventSlug: string;
  activities: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startsAt: Date;
    endsAt: Date | null;
    costCents: number;
    rsvpStatus: GuestRsvpStatus;
  }[];
};

export function GuestActivitiesSection({
  eventSlug,
  activities,
}: GuestActivitiesSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">Timeline</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your itinerary — tap to RSVP for each activity.
      </p>

      {activities.length > 0 ? (
        <div className="mt-4">
          <EventTimeline
            activities={activities}
            showLocation={false}
            renderActivity={(activity) => (
              <div className="pb-6 last:pb-0">
                <p className="text-sm font-medium text-primary">
                  {activity.timeLabel} — {activity.title}
                </p>
                <div className="mt-3">
                  <ActivityRsvpCard
                    eventSlug={eventSlug}
                    activity={activity}
                    variant="timeline"
                  />
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          icon={ListTodo}
          title="No activities yet"
          description="The organiser is still building the itinerary. Check back soon."
        />
      )}
    </section>
  );
}
