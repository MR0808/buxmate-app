import Link from "next/link";
import { EventNav } from "@/components/layout/event-nav";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { formatEventDateRange } from "@/lib/events/format";
import { getOrganiserEvent } from "@/lib/events";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getOrganiserEvent(eventId);
  const dateRange = formatEventDateRange(event.startsAt, event.endsAt);

  return (
    <div className="pb-20 md:pb-10">
      <div className="border-b border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Events
          </Link>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary">
                {event.eventType}
              </p>
              <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
                {event.name}
              </h1>
              {event.location ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.location}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-muted-foreground">{dateRange}</p>
            </div>
            <EventStatusBadge status={event.status} className="shrink-0" />
          </div>
          <div className="mt-6">
            <EventNav eventId={event.id} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
