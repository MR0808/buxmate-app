import { Settings } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrganiserEvent } from "@/lib/events";

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getOrganiserEvent(eventId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold">Event settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Event details and privacy
        </p>
      </div>

      <section className="buxmate-card space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Event slug
          </p>
          <p className="mt-1 font-mono text-sm">{event.slug}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          <p className="mt-1 capitalize">{event.status.toLowerCase()}</p>
        </div>
      </section>

      <div className="mt-8">
        <EmptyState
          icon={Settings}
          title="More settings coming soon"
          description="Edit event details, payment instructions, and cover photo in a future update."
        />
      </div>
    </main>
  );
}
