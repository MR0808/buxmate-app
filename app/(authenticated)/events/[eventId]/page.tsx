import { CalendarDays, CreditCard, Link2, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { getOrganiserEvent } from "@/lib/events";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getOrganiserEvent(eventId);

  const dateRange =
    event.startsAt && event.endsAt
      ? `${event.startsAt.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        })} – ${event.endsAt.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : event.startsAt
        ? event.startsAt.toLocaleDateString("en-AU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Dates not set";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {event.description ? (
        <section className="buxmate-card p-6">
          <h2 className="font-heading text-lg font-semibold">About</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dates" value={dateRange} icon={CalendarDays} />
        <StatCard label="Guests" value="0" hint="Add guests" icon={Users} />
        <StatCard label="Activities" value="0" hint="Build itinerary" icon={CalendarDays} />
        <StatCard label="Payments" value="—" hint="Track amounts owed" icon={CreditCard} />
      </section>

      <section className="mt-8">
        <EmptyState
          icon={Link2}
          title="Invite links coming next"
          description="Generate private invite links from the Guests tab."
        />
      </section>
    </main>
  );
}
