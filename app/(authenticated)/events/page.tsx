import Link from "next/link";
import { ArrowRight, Plus, PartyPopper } from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import {
  formatCreatedDate,
  formatEventDateRange,
} from "@/lib/events/format";
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
          <div className="grid gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="buxmate-card block p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs uppercase tracking-wider text-primary">
                        {event.eventType}
                      </p>
                      <EventStatusBadge status={event.status} />
                    </div>
                    <h2 className="mt-2 font-heading text-xl font-semibold">
                      {event.name}
                    </h2>
                    {event.location ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatEventDateRange(event.startsAt, event.endsAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {formatCreatedDate(event.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
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
