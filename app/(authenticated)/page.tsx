import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  PartyPopper,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { formatEventDate, formatEventDateRange } from "@/lib/events/format";
import { getDashboardEventStats } from "@/lib/events";
import { requireVerifiedOrganiser } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireVerifiedOrganiser();
  const { total, active, draft, archived, nextUpcoming, recentEvents } =
    await getDashboardEventStats();

  const firstName = session.user.name.split(" ")[0];
  const hasEvents = total > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="buxmate-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold">
              Welcome back, {firstName}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Your dashboard for private events — guests, RSVPs and payments
              will appear here as you build them out.
            </p>
          </div>
          <Button
            className="shrink-0 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href="/events/new">
              <Plus className="size-4" aria-hidden />
              Create event
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total events" value={String(total)} icon={PartyPopper} />
        <StatCard label="Active" value={String(active)} icon={CalendarDays} />
        <StatCard label="Draft" value={String(draft)} icon={PartyPopper} />
        <StatCard label="Archived" value={String(archived)} icon={PartyPopper} />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Guests"
          value="—"
          hint="Coming soon — per event"
          icon={Users}
        />
        <StatCard
          label="RSVPs"
          value="—"
          hint="Coming soon — per activity"
          icon={CalendarDays}
        />
        <StatCard
          label="Payments"
          value="—"
          hint="Coming soon — track amounts owed"
          icon={CreditCard}
          className="sm:col-span-2"
        />
      </section>

      {nextUpcoming ? (
        <section className="mt-8">
          <h2 className="font-heading text-xl font-semibold">Next event</h2>
          <Link
            href={`/events/${nextUpcoming.id}`}
            className="buxmate-card mt-4 block p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-wider text-primary">
              {nextUpcoming.eventType}
            </p>
            <h3 className="mt-2 font-heading text-lg font-semibold">
              {nextUpcoming.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatEventDate(nextUpcoming.startsAt)}
              {nextUpcoming.location ? ` · ${nextUpcoming.location}` : ""}
            </p>
          </Link>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-semibold">Recent events</h2>
          {hasEvents ? (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href="/events">View all</Link>
            </Button>
          ) : null}
        </div>

        {hasEvents ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="buxmate-card block p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs uppercase tracking-wider text-primary">
                    {event.eventType}
                  </p>
                  <EventStatusBadge status={event.status} />
                </div>
                <h3 className="mt-2 font-heading text-lg font-semibold">
                  {event.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatEventDateRange(event.startsAt, null)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PartyPopper}
            title="No events yet"
            description="Create an event to get started. You can add activities and guests next."
            action={
              <Button className="rounded-full normal-case tracking-normal" asChild>
                <Link href="/events/new">Create event</Link>
              </Button>
            }
          />
        )}
      </section>
    </main>
  );
}
