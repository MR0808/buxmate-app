import Link from "next/link";
import { Shield } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { EmptyState } from "@/components/shared/empty-state";
import { GuestActivitiesSection } from "@/components/guest/guest-activities-section";
import { GuestEventOverview } from "@/components/guest/guest-event-overview";
import { GuestPaymentsSection } from "@/components/guest/guest-payments-section";
import { GuestRsvpSummary } from "@/components/guest/guest-rsvp-summary";
import { GuestUpdatesSection } from "@/components/feed/guest-updates-section";
import { GuestPhotosSection } from "@/components/photos/guest-photos-section";
import { getGuestEventPageData } from "@/lib/guest-access";

type GuestEventPageProps = {
  params: Promise<{ eventSlug: string }>;
};

function GuestEventShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
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

  const { guest, activities, payments, posts, photos } = data;

  return (
    <GuestEventShell>
      <GuestEventOverview guestName={guest.name} event={guest.event} />

      <GuestActivitiesSection eventSlug={eventSlug} activities={activities} />

      <GuestRsvpSummary activities={activities} />

      <GuestPaymentsSection
        summary={payments.summary}
        activityAllocations={payments.activityAllocations}
        sharedAllocations={payments.sharedAllocations}
        paymentInstructions={payments.paymentInstructions}
      />

      <GuestUpdatesSection posts={posts} />

      <GuestPhotosSection
        eventSlug={eventSlug}
        guestId={guest.id}
        photos={photos}
      />
    </GuestEventShell>
  );
}
