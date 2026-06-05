import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function EventGuestsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold">Guests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your guest list and invite links.
        </p>
      </div>

      <EmptyState
        icon={Users}
        title="No guests yet"
        description="Add guests and send private invite links. Guests can RSVP without a full account."
      />
    </main>
  );
}
