import Link from "next/link";
import { PartyPopper, Plus } from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DuplicateEventButton } from "@/components/events/duplicate-event-button";
import { EventCard } from "@/components/events/event-card";
import { formatCreatedDate } from "@/lib/events/format";
import { getOrganiserEvents } from "@/lib/events";

export default async function EventsPage() {
  const events = await getOrganiserEvents();
  const activeEvents = events.filter((e) => e.status !== EventStatus.ARCHIVED);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Events</h1>
          <p className="mt-2 text-muted-foreground">
            {events.length === 0
              ? "Create and manage your private events"
              : `${activeEvents.length} active · ${events.length} total`}
          </p>
        </div>
        <Button className="rounded-full normal-case tracking-normal" asChild>
          <Link href="/events/new">
            <Plus className="size-4" aria-hidden />
            Create event
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  href={`/events/${event.id}`}
                  name={event.name}
                  eventType={event.eventType}
                  status={event.status}
                  startsAt={event.startsAt}
                  endsAt={event.endsAt}
                  location={event.location}
                  guestCount={event.guestCount}
                  coverSignedUrl={event.coverSignedUrl}
                  meta={`Created ${formatCreatedDate(event.createdAt)}`}
                />
                <div className="absolute right-4 top-4 z-10">
                  <DuplicateEventButton
                    eventId={event.id}
                    eventName={event.name}
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PartyPopper}
            title="No events yet"
            description="Create your first event to start planning activities, guests, and payments."
            action={
              <Button className="rounded-full normal-case tracking-normal" asChild>
                <Link href="/events/new">Create event</Link>
              </Button>
            }
          />
        )}
      </div>
    </main>
  );
}
