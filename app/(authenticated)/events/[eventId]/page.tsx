import { EventCommandHeader } from "@/components/dashboard/event-command-header";
import { EventMetricsGrid } from "@/components/dashboard/event-metrics-grid";
import { GuestInsightsSection } from "@/components/dashboard/guest-insights-section";
import { GuestStatusSection } from "@/components/dashboard/guest-status-section";
import { PaymentSummarySection } from "@/components/dashboard/payment-summary-section";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { RecentAnnouncementsSection } from "@/components/dashboard/recent-announcements-section";
import { RecentPhotosPreview } from "@/components/dashboard/recent-photos-preview";
import { UpcomingActivitiesSection } from "@/components/dashboard/upcoming-activities-section";
import { EventDashboardWarnings } from "@/components/events/event-dashboard-warnings";
import { EventSetupGuide } from "@/components/events/event-setup-guide";
import { SendRsvpReminderButton } from "@/components/emails/send-rsvp-reminder-button";
import { getEventSetupProgress } from "@/lib/events/setup-progress";
import { getEventCommandCentreData } from "@/lib/event-dashboard";
import { getGuestDashboardInsights } from "@/lib/guests/queries";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [data, guestInsights, setupProgress] = await Promise.all([
    getEventCommandCentreData(eventId),
    getGuestDashboardInsights(eventId),
    getEventSetupProgress(eventId),
  ]);

  const hasCosts = setupProgress.steps.find((s) => s.id === "costs")?.completed;
  const hasGuests = setupProgress.steps.find((s) => s.id === "guests")?.completed;
  const hasInvites = setupProgress.steps.find((s) => s.id === "invites")?.completed;
  const hasRsvps = setupProgress.steps.find((s) => s.id === "track-rsvps")?.completed;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <EventCommandHeader
        event={data.event}
        canManage={data.canManage}
        eventId={eventId}
      />

      {data.canManage ? (
        <>
          <div className="mt-8">
            <EventSetupGuide progress={setupProgress} />
          </div>

          <EventDashboardWarnings
            eventId={eventId}
            hasCosts={Boolean(hasCosts)}
            hasGuests={Boolean(hasGuests)}
            hasRsvps={Boolean(hasRsvps)}
            hasInvites={Boolean(hasInvites)}
            needsReviewCount={data.metrics.payments.needsReviewCount}
          />
        </>
      ) : null}

      <EventMetricsGrid metrics={data.metrics} />

      <UpcomingActivitiesSection
        eventId={eventId}
        activities={data.upcomingActivities}
        canManage={data.canManage}
      />

      {data.canManage && data.metrics.activities.active > 0 ? (
        <div className="mt-4 flex justify-end">
          <SendRsvpReminderButton eventId={eventId} />
        </div>
      ) : null}

      <GuestStatusSection
        eventId={eventId}
        guestStatus={data.guestStatus}
        canManage={data.canManage}
      />

      <GuestInsightsSection
        eventId={eventId}
        recentlyJoined={guestInsights.recentlyJoined}
        needingRsvp={guestInsights.needingRsvp}
        outstandingPayments={guestInsights.outstandingPayments}
        neverOpened={guestInsights.neverOpened}
        canManage={data.canManage}
      />

      <PaymentSummarySection
        eventId={eventId}
        payments={data.metrics.payments}
        topOutstandingGuests={data.topOutstandingGuests}
        canManage={data.canManage}
      />

      <RecentAnnouncementsSection
        eventId={eventId}
        announcements={data.recentAnnouncements}
        canManage={data.canManage}
      />

      <RecentPhotosPreview
        eventId={eventId}
        photos={data.recentPhotos}
        totalCount={data.metrics.photos.total}
        canManage={data.canManage}
      />

      <QuickActionsGrid eventId={eventId} canManage={data.canManage} />
    </main>
  );
}
