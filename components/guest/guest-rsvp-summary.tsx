import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { GuestRsvpStatus } from "@/lib/rsvp-labels";
import { RSVP_STATUS_LABELS } from "@/lib/rsvp-labels";

type GuestRsvpSummaryProps = {
  activities: { rsvpStatus: GuestRsvpStatus }[];
};

export function GuestRsvpSummary({ activities }: GuestRsvpSummaryProps) {
  const counts = {
    GOING: 0,
    MAYBE: 0,
    NOT_GOING: 0,
    PENDING: 0,
  } as Record<GuestRsvpStatus, number>;

  for (const activity of activities) {
    counts[activity.rsvpStatus] += 1;
  }

  const answered = activities.length - counts.PENDING;

  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">Your RSVPs</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {activities.length === 0
          ? "Your responses will appear here once activities are added."
          : answered === activities.length
            ? "You have responded to every activity."
            : `${answered} of ${activities.length} activities answered`}
      </p>

      {activities.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["GOING", "MAYBE", "NOT_GOING", "PENDING"] as const).map(
            (status) => (
              <div key={status} className="buxmate-card p-4 text-center">
                <p className="font-heading text-2xl font-semibold">
                  {counts[status]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {RSVP_STATUS_LABELS[status].guest}
                </p>
              </div>
            ),
          )}
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          icon={CalendarCheck}
          title="No activities yet"
          description="When the organiser adds activities, you can RSVP from this page."
        />
      )}
    </section>
  );
}
