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
import { EventCard } from "@/components/events/event-card";
import { formatEventDate } from "@/lib/events/format";
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
              appear here as you build them out.
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
          <div className="mt-4">
            <EventCard
              href={`/events/${nextUpcoming.id}`}
              name={nextUpcoming.name}
              eventType={nextUpcoming.eventType}
              status={nextUpcoming.status}
              startsAt={nextUpcoming.startsAt}
              endsAt={nextUpcoming.endsAt}
              location={nextUpcoming.location}
              guestCount={nextUpcoming.guestCount}
              coverSignedUrl={nextUpcoming.coverSignedUrl}
              meta={formatEventDate(nextUpcoming.startsAt)}
            />
          </div>
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
              <EventCard
                key={event.id}
                href={`/events/${event.id}`}
                name={event.name}
                eventType={event.eventType}
                status={event.status}
                startsAt={event.startsAt}
                endsAt={event.endsAt}
                location={event.location}
                guestCount={event.guestCount}
                coverSignedUrl={event.coverSignedUrl}
              />
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
