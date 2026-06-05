import Link from "next/link";
import { ActivityStatus } from "@/generated/prisma/client";
import { ActivityForm } from "@/components/activities/activity-form";
import { activityToFormInput } from "@/lib/activities/form-input";
import { getOrganiserActivity } from "@/lib/activities";
import { getOrganiserEvent } from "@/lib/events";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ eventId: string; activityId: string }>;
}) {
  const { eventId, activityId } = await params;
  const [event, activity] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserActivity(eventId, activityId),
  ]);

  if (activity.status === ActivityStatus.ARCHIVED) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-muted-foreground">
          Archived activities cannot be edited.{" "}
          <Link
            href={`/events/${eventId}/activities/${activityId}`}
            className="text-primary hover:underline"
          >
            View activity
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Link
          href={`/events/${eventId}/activities/${activityId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {activity.title}
        </Link>
        <p className="mt-3 text-xs uppercase tracking-wider text-primary">
          {event.name}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">Edit activity</h1>
      </div>

      <div className="buxmate-card p-6 sm:p-8">
        <ActivityForm
          eventId={eventId}
          activityId={activityId}
          mode="edit"
          initial={activityToFormInput(activity)}
          cancelHref={`/events/${eventId}/activities/${activityId}`}
        />
      </div>
    </main>
  );
}
