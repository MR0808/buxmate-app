import Link from "next/link";
import { CalendarDays, MapPin, Pencil, Settings } from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { formatEventDateRange } from "@/lib/events/format";
import type { EventCommandCentreData } from "@/lib/event-dashboard";

type EventCommandHeaderProps = {
  event: EventCommandCentreData["event"];
  canManage: boolean;
  eventId: string;
};

export function EventCommandHeader({
  event,
  canManage,
  eventId,
}: EventCommandHeaderProps) {
  const basePath = `/events/${eventId}`;
  const dateRange = formatEventDateRange(event.startsAt, event.endsAt);

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <EventCoverImage
        signedUrl={event.coverSignedUrl}
        height="lg"
        priority
      />

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <EventStatusBadge status={event.status} />
          <span className="text-xs uppercase tracking-wider text-primary">
            {event.eventType}
          </span>
        </div>

        <h1 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">
          {event.name}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {dateRange}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {event.location}
            </span>
          ) : null}
        </div>

        {event.description?.trim() ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        ) : null}

        {canManage ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/settings`}>
                <Pencil className="size-4" aria-hidden />
                Edit event
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/guests`}>Manage guests</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/activities`}>Manage activities</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/payments`}>Manage payments</Link>
            </Button>
            {event.status === EventStatus.ARCHIVED ? (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full normal-case tracking-normal"
                asChild
              >
                <Link href={`${basePath}/settings`}>
                  <Settings className="size-4" aria-hidden />
                  Settings
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
