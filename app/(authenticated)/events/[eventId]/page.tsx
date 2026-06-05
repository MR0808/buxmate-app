import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  ListTodo,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EventFeatureCard } from "@/components/events/event-feature-card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { formatEventDateRange } from "@/lib/events/format";
import { getOrganiserEvent } from "@/lib/events";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getOrganiserEvent(eventId);
  const basePath = `/events/${eventId}`;
  const dateRange = formatEventDateRange(event.startsAt, event.endsAt);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="buxmate-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <EventStatusBadge status={event.status} />
          <span className="text-xs text-muted-foreground">
            Created{" "}
            {event.createdAt.toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Dates
            </dt>
            <dd className="mt-1 text-sm font-medium">{dateRange}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Location
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {event.location ?? "Not set"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Description
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {event.description?.trim()
                ? event.description
                : "No description yet."}
            </dd>
          </div>
        </dl>

        {event.status !== EventStatus.ARCHIVED ? (
          <Button
            className="mt-6 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={`${basePath}/activities`}>
              <ListTodo className="size-4" aria-hidden />
              Add activities
            </Link>
          </Button>
        ) : null}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Guests" value="—" hint="Coming soon" icon={Users} />
        <StatCard label="RSVPs" value="—" hint="Coming soon" icon={CalendarDays} />
        <StatCard label="Activities" value="0" hint="Add your itinerary" icon={ListTodo} />
        <StatCard label="Payments" value="—" hint="Coming soon" icon={CreditCard} />
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Event sections</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EventFeatureCard
            href={`${basePath}/activities`}
            title="Activities"
            description="Build the itinerary for your weekend."
            icon={ListTodo}
            comingSoon
          />
          <EventFeatureCard
            href={`${basePath}/guests`}
            title="Guests"
            description="Invite guests and track RSVPs."
            icon={Users}
            comingSoon
          />
          <EventFeatureCard
            href={`${basePath}/payments`}
            title="Payments"
            description="Track who owes what."
            icon={CreditCard}
            comingSoon
          />
          <EventFeatureCard
            href={`${basePath}/feed`}
            title="Feed"
            description="Updates and announcements for guests."
            icon={MessageSquare}
            comingSoon
          />
          <EventFeatureCard
            href={`${basePath}/settings`}
            title="Settings"
            description="Edit event details or archive this event."
            icon={Settings}
          />
        </div>
      </section>
    </main>
  );
}
