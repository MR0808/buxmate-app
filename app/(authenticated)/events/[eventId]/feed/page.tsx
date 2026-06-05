import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function EventFeedPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold">Feed</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Updates and announcements for this event.
        </p>
      </div>

      <EmptyState
        icon={MessageSquare}
        title="No posts yet"
        description="Share updates with your guests — reminders, itinerary changes, or announcements."
      />
    </main>
  );
}
