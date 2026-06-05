import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function EventActivitiesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold">Activities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build the itinerary for this event.
        </p>
      </div>

      <EmptyState
        icon={CalendarDays}
        title="No activities yet"
        description="Add activities with times, locations and costs. Guests RSVP to each one."
      />
    </main>
  );
}
