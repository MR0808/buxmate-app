import Link from "next/link";
import { Shield } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityRsvpCard } from "@/components/guest/activity-rsvp-card";
import { GuestPaymentsSection } from "@/components/guest/guest-payments-section";
import { GuestUpdatesSection } from "@/components/feed/guest-updates-section";
import { formatEventDateRange } from "@/lib/events/format";
import { getGuestEventPageData } from "@/lib/guest-access";

type GuestEventPageProps = {
  params: Promise<{ eventSlug: string }>;
};

function GuestEventShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Lost your invite? Ask the organiser for a new link.
        </p>
      </main>
    </div>
  );
}

export default async function GuestEventPage({ params }: GuestEventPageProps) {
  const { eventSlug } = await params;
  const data = await getGuestEventPageData(eventSlug);

  if (!data) {
    return (
      <GuestEventShell>
        <EmptyState
          icon={Shield}
          title="Open your invite link"
          description="Use the private link from your organiser to view this event and RSVP to activities."
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Organiser sign in
          </Link>
        </p>
      </GuestEventShell>
    );
  }

  const { guest, activities, payments, posts } = data;
  const firstName = guest.name.split(" ")[0];
  const dateRange = formatEventDateRange(
    guest.event.startsAt,
    guest.event.endsAt,
  );

  return (
    <GuestEventShell>
      <div className="buxmate-card p-6 sm:p-8">
        <p className="text-xs uppercase tracking-wider text-primary">
          {guest.event.eventType}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          {guest.event.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Hi {firstName} — thanks for joining.
        </p>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              When
            </dt>
            <dd className="mt-1 font-medium">{dateRange}</dd>
          </div>
          {guest.event.location ? (
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Where
              </dt>
              <dd className="mt-1 font-medium">{guest.event.location}</dd>
            </div>
          ) : null}
          {guest.event.description?.trim() ? (
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                About
              </dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">
                {guest.event.description}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <GuestUpdatesSection posts={posts} />

      <section className="mt-8">
        <h2 className="font-heading text-xl font-semibold">Activities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Let the organiser know what you can make.
        </p>

        {activities.length > 0 ? (
          <div className="mt-4 space-y-4">
            {activities.map((activity) => (
              <ActivityRsvpCard
                key={activity.id}
                eventSlug={eventSlug}
                activity={activity}
              />
            ))}
          </div>
        ) : (
          <p className="buxmate-card mt-4 p-6 text-sm text-muted-foreground">
            No activities have been added yet. Check back soon.
          </p>
        )}
      </section>

      <GuestPaymentsSection
        summary={payments.summary}
        allocations={payments.allocations}
        paymentInstructions={payments.paymentInstructions}
      />
    </GuestEventShell>
  );
}
