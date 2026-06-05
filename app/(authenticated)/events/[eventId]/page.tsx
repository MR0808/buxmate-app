import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  ListTodo,
  MapPin,
  MessageSquare,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EventFeatureCard } from "@/components/events/event-feature-card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { ActivityStatusBadge } from "@/components/activities/activity-status-badge";
import { StatCard } from "@/components/shared/stat-card";
import {
  formatActivityCost,
  formatActivityTimeRange,
} from "@/lib/activities/format";
import { getEventActivitySummary } from "@/lib/activities";
import { GuestStatusBadge } from "@/components/guests/guest-status-badge";
import { formatEventDateRange } from "@/lib/events/format";
import { getEventGuestSummary } from "@/lib/guests";
import { getOrganiserEvent } from "@/lib/events";
import { formatMoney } from "@/lib/payments/format";
import { getEventPaymentSummary } from "@/lib/payments";
import { getEventRsvpResponseCount } from "@/lib/rsvp";
import { getEventPostSummary } from "@/lib/posts";
import { formatPostDateTime } from "@/lib/posts/format";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [
    event,
    activitySummary,
    guestSummary,
    rsvpResponses,
    paymentSummary,
    postSummary,
  ] = await Promise.all([
    getOrganiserEvent(eventId),
    getEventActivitySummary(eventId),
    getEventGuestSummary(eventId),
    getEventRsvpResponseCount(eventId),
    getEventPaymentSummary(eventId),
    getEventPostSummary(eventId),
  ]);

  const basePath = `/events/${eventId}`;
  const dateRange = formatEventDateRange(event.startsAt, event.endsAt);
  const { activeCount, totalCount, upcoming, nextActivity } = activitySummary;
  const { totalCount: guestCount, invitedCount, joinedCount, recentGuests } =
    guestSummary;
  const canManage = event.status !== EventStatus.ARCHIVED;

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
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Activities"
          value={String(activeCount)}
          hint={
            totalCount > activeCount
              ? `${totalCount} total including archived`
              : "Active in itinerary"
          }
          icon={ListTodo}
        />
        <StatCard
          label="Guests"
          value={String(guestCount)}
          hint={`${invitedCount} invited · ${joinedCount} joined`}
          icon={Users}
        />
        <StatCard
          label="RSVPs"
          value={String(rsvpResponses)}
          hint="Responses across activities"
          icon={CalendarDays}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(paymentSummary.outstanding)}
          hint={`${formatMoney(paymentSummary.paid)} paid`}
          icon={CreditCard}
        />
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Itinerary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeCount === 0
                ? "No activities scheduled yet."
                : nextActivity
                  ? "Your next scheduled activity"
                  : "Upcoming and past activities"}
            </p>
          </div>
          {canManage ? (
            <Button
              className="shrink-0 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/activities/new`}>
                <Plus className="size-4" aria-hidden />
                Add activity
              </Link>
            </Button>
          ) : null}
        </div>

        {nextActivity ? (
          <Link
            href={`${basePath}/activities/${nextActivity.id}`}
            className="buxmate-card mt-4 block p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary">
                  Next activity
                </p>
                <h3 className="mt-2 font-heading text-lg font-semibold">
                  {nextActivity.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatActivityTimeRange(
                    nextActivity.startsAt,
                    nextActivity.endsAt,
                  )}
                </p>
                {nextActivity.location ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    {nextActivity.location}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-medium">
                  {formatActivityCost(nextActivity.costCents)}
                </p>
              </div>
              <ActivityStatusBadge status={nextActivity.status} />
            </div>
          </Link>
        ) : activeCount === 0 && canManage ? (
          <div className="buxmate-card mt-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Add the first activity for this event.
            </p>
            <Button
              className="mt-4 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/activities/new`}>Add activity</Link>
            </Button>
          </div>
        ) : null}

        {upcoming.length > 1 ? (
          <div className="mt-4 grid gap-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Upcoming
            </p>
            {upcoming.slice(nextActivity ? 1 : 0).map((activity) => (
              <Link
                key={activity.id}
                href={`${basePath}/activities/${activity.id}`}
                className="buxmate-card flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="font-medium">{activity.title}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {formatActivityTimeRange(activity.startsAt, activity.endsAt)}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
              </Link>
            ))}
          </div>
        ) : null}

        {activeCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={`${basePath}/activities`}>View all activities</Link>
          </Button>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Guests</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {guestCount === 0
                ? "Add guests and share private invite links."
                : `${invitedCount} invited · ${joinedCount} joined`}
            </p>
          </div>
          {canManage ? (
            <Button
              className="shrink-0 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/guests/new`}>
                <Plus className="size-4" aria-hidden />
                Add guest
              </Link>
            </Button>
          ) : null}
        </div>

        {recentGuests.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recentGuests.map((guest) => (
              <Link
                key={guest.id}
                href={`${basePath}/guests/${guest.id}`}
                className="buxmate-card flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="font-medium">{guest.name}</p>
                  {guest.email ? (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {guest.email}
                    </p>
                  ) : null}
                </div>
                <GuestStatusBadge status={guest.status} />
              </Link>
            ))}
          </div>
        ) : canManage ? (
          <div className="buxmate-card mt-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No guests yet. Add your first guest and share their private invite
              link.
            </p>
            <Button
              className="mt-4 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/guests/new`}>Add guest</Link>
            </Button>
          </div>
        ) : null}

        {guestCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={`${basePath}/guests`}>View all guests</Link>
          </Button>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Updates</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {postSummary.activeCount === 0
                ? "Share announcements with your guests."
                : `${postSummary.activeCount} post${postSummary.activeCount === 1 ? "" : "s"} visible to guests`}
            </p>
          </div>
          {canManage ? (
            <Button
              className="shrink-0 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/feed`}>
                <Plus className="size-4" aria-hidden />
                Post update
              </Link>
            </Button>
          ) : null}
        </div>

        {postSummary.latestAnnouncement ? (
          <Link
            href={`${basePath}/feed`}
            className="buxmate-card mt-4 block p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-wider text-primary">
              Latest announcement
              {postSummary.latestAnnouncement.pinned ? " · Pinned" : ""}
            </p>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed">
              {postSummary.latestAnnouncement.content}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {formatPostDateTime(postSummary.latestAnnouncement.createdAt)}
            </p>
          </Link>
        ) : canManage ? (
          <div className="buxmate-card mt-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Post your first announcement for guests on their event page.
            </p>
            <Button
              className="mt-4 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/feed`}>Post update</Link>
            </Button>
          </div>
        ) : null}

        {postSummary.activeCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={`${basePath}/feed`}>View all updates</Link>
          </Button>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Payments</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {paymentSummary.allocated === 0
                ? "Track costs and who has paid."
                : `${formatMoney(paymentSummary.outstanding)} outstanding · ${formatMoney(paymentSummary.paid)} paid`}
            </p>
          </div>
          {canManage ? (
            <Button
              className="shrink-0 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/payments/new`}>
                <Plus className="size-4" aria-hidden />
                Add payment
              </Link>
            </Button>
          ) : null}
        </div>
        {paymentSummary.allocated > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={`${basePath}/payments`}>Manage payments</Link>
          </Button>
        ) : canManage ? (
          <div className="buxmate-card mt-4 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Add a payment item and split it across guests.
            </p>
            <Button
              className="mt-4 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`${basePath}/payments/new`}>Add payment</Link>
            </Button>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Event sections</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EventFeatureCard
            href={`${basePath}/activities`}
            title="Activities"
            description="Build the itinerary for your weekend."
            icon={ListTodo}
          />
          <EventFeatureCard
            href={`${basePath}/guests`}
            title="Guests"
            description="Manage guests and private invite links."
            icon={Users}
          />
          <EventFeatureCard
            href={`${basePath}/payments`}
            title="Payments"
            description="Track who owes what."
            icon={CreditCard}
          />
          <EventFeatureCard
            href={`${basePath}/feed`}
            title="Updates"
            description="Announcements and notes for your guests."
            icon={MessageSquare}
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
