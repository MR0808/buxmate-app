import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { EventStatus } from "@/generated/prisma/client";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { formatEventDateRange } from "@/lib/events/format";

type EventCardProps = {
  href: string;
  name: string;
  eventType: string;
  status: EventStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  location?: string | null;
  guestCount?: number;
  coverSignedUrl?: string | null;
  meta?: string;
};

export function EventCard({
  href,
  name,
  eventType,
  status,
  startsAt,
  endsAt,
  location,
  guestCount,
  coverSignedUrl,
  meta,
}: EventCardProps) {
  return (
    <Link
      href={href}
      className="buxmate-card group block overflow-hidden transition-shadow hover:shadow-md"
    >
      <EventCoverImage
        signedUrl={coverSignedUrl ?? null}
        height="sm"
        overlay={false}
      />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-wider text-primary">
            {eventType}
          </p>
          <EventStatusBadge status={status} />
        </div>
        <h2 className="mt-2 font-heading text-xl font-semibold group-hover:text-primary">
          {name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatEventDateRange(startsAt, endsAt)}
        </p>
        {location ? (
          <p className="mt-1 text-sm text-muted-foreground">{location}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {guestCount !== undefined ? (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" aria-hidden />
                {guestCount} guest{guestCount === 1 ? "" : "s"}
              </span>
            ) : null}
            {meta ? <span>{meta}</span> : null}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
            Open
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
