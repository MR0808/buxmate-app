import { CalendarDays, MapPin } from "lucide-react";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { formatEventDateRange } from "@/lib/events/format";

type GuestEventOverviewProps = {
  guestName: string;
  event: {
    name: string;
    eventType: string;
    location: string | null;
    description: string | null;
    startsAt: Date | null;
    endsAt: Date | null;
    coverSignedUrl?: string | null;
  };
};

export function GuestEventOverview({
  guestName,
  event,
}: GuestEventOverviewProps) {
  const firstName = guestName.split(" ")[0];
  const dateRange = formatEventDateRange(event.startsAt, event.endsAt);

  return (
    <section aria-label="Event overview" className="buxmate-card overflow-hidden">
      <EventCoverImage
        signedUrl={event.coverSignedUrl ?? null}
        height="hero"
        priority
        alt=""
      />

      <div className="p-6 sm:p-8">
        <p className="text-xs uppercase tracking-wider text-primary">
          {event.eventType}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight">
          {event.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Hi {firstName} — welcome to your private event page.
        </p>

        <dl className="mt-6 space-y-4 border-t border-border/60 pt-6 text-sm">
          <div className="flex gap-3">
            <CalendarDays
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                When
              </dt>
              <dd className="mt-1 font-medium">{dateRange}</dd>
            </div>
          </div>
          {event.location ? (
            <div className="flex gap-3">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Where
                </dt>
                <dd className="mt-1 font-medium">{event.location}</dd>
              </div>
            </div>
          ) : null}
          {event.description?.trim() ? (
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                About
              </dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                {event.description}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
