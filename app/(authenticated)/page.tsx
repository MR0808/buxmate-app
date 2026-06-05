import Link from "next/link";
import { CalendarDays, CreditCard, PartyPopper, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { requireVerifiedOrganiser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await requireVerifiedOrganiser();

  const events = await prisma.event.findMany({
    where: { organiserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      eventType: true,
      status: true,
      startsAt: true,
    },
  });

  const hasEvents = events.length > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="buxmate-card overflow-hidden p-6 sm:p-8">
        <h1 className="font-heading text-3xl font-semibold">
          Welcome back, {session.user.name.split(" ")[0]}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Manage your private events, guests, RSVPs and payments in one place.
        </p>
        {!hasEvents ? (
          <Button
            className="mt-6 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href="/events/new">Create event</Link>
          </Button>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Events" value={String(events.length)} icon={PartyPopper} />
        <StatCard label="Guests" value="—" hint="Per event" icon={Users} />
        <StatCard label="RSVPs" value="—" hint="Per activity" icon={CalendarDays} />
        <StatCard label="Payments" value="—" hint="Track amounts owed" icon={CreditCard} />
      </section>

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
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="buxmate-card block p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-wider text-primary">
                  {event.eventType}
                </p>
                <h3 className="mt-2 font-heading text-lg font-semibold">
                  {event.name}
                </h3>
                <p className="mt-2 text-sm capitalize text-muted-foreground">
                  {event.status.toLowerCase()}
                  {event.startsAt
                    ? ` · ${event.startsAt.toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`
                    : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PartyPopper}
            title="No events yet"
            description="Create an event to add activities, invite guests, and track RSVPs and payments."
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
