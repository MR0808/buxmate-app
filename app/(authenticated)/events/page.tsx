import Link from "next/link";
import { Plus, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { requireVerifiedOrganiser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function EventsPage() {
  const session = await requireVerifiedOrganiser();

  const events = await prisma.event.findMany({
    where: { organiserId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      eventType: true,
      location: true,
      status: true,
      startsAt: true,
      endsAt: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Events</h1>
          <p className="mt-2 text-muted-foreground">
            Your private events
          </p>
        </div>
        <Button className="rounded-full normal-case tracking-normal" asChild>
          <Link href="/events/new">
            <Plus className="size-4" aria-hidden />
            New event
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary">
                      {event.eventType}
                    </p>
                    <h2 className="mt-1 font-heading text-xl font-semibold">
                      {event.name}
                    </h2>
                    {event.location ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-sm capitalize text-muted-foreground">
                    {event.status.toLowerCase()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PartyPopper}
            title="No events yet"
            description="Create an event to manage guests, activities, and payments."
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
