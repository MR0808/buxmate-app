import Link from "next/link";
import { Mail, Pencil, Phone } from "lucide-react";
import { GuestStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { SendPaymentReminderButton } from "@/components/emails/send-payment-reminder-button";
import { ArchiveGuestSection } from "@/components/guests/archive-guest-section";
import { SendGuestInviteButton } from "@/components/emails/send-guest-invite-button";
import { GuestInviteLinkPanel } from "@/components/guests/guest-invite-link-panel";
import { GuestInviteStatusPanel } from "@/components/guests/guest-invite-status-panel";
import { GuestProfileSections } from "@/components/guests/guest-profile-sections";
import { GuestOfHonourBadge } from "@/components/guests/guest-of-honour-badge";
import { GuestOfHonourToggle } from "@/components/guests/guest-of-honour-toggle";
import { GuestStatusBadge } from "@/components/guests/guest-status-badge";
import { buildGuestInviteUrl } from "@/lib/guests/invite-url";
import { getGuestProfile } from "@/lib/guests/queries";
import { getOrganiserEvent } from "@/lib/events";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; guestId: string }>;
}) {
  const { eventId, guestId } = await params;
  const [event, profile] = await Promise.all([
    getOrganiserEvent(eventId),
    getGuestProfile(eventId, guestId),
  ]);

  const { guest, rsvpSummary, paymentSummary, activityRsvps, paymentItems, recentActivity } =
    profile;
  const isArchived = guest.status === GuestStatus.ARCHIVED;
  const inviteUrl = buildGuestInviteUrl(guest.inviteToken);
  const canManage = event.status !== "ARCHIVED";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/events/${eventId}/guests`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Guests
          </Link>
          <p className="mt-2 text-xs uppercase tracking-wider text-primary">
            {event.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
              {guest.name}
            </h1>
            <GuestStatusBadge status={guest.status} />
            {guest.isGuestOfHonour ? <GuestOfHonourBadge /> : null}
          </div>
        </div>
        {!isArchived && canManage ? (
          <div className="flex flex-wrap gap-2">
            <SendGuestInviteButton
              eventId={eventId}
              guestId={guestId}
              guestEmail={guest.email}
              variant="default"
              size="default"
            />
            {paymentSummary.outstanding > 0 ? (
              <SendPaymentReminderButton
                eventId={eventId}
                mode="guest"
                guestId={guestId}
                guestName={guest.name}
                outstandingCents={paymentSummary.outstanding}
              />
            ) : null}
            <Button
              variant="outline"
              className="shrink-0 rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href={`/events/${eventId}/guests/${guestId}/edit`}>
                <Pencil className="size-4" aria-hidden />
                Edit
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <section className="buxmate-card space-y-4 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold">Guest details</h2>
        {guest.email ? (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-muted-foreground" aria-hidden />
            <span>{guest.email}</span>
          </div>
        ) : null}
        {guest.phone ? (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" aria-hidden />
            <span>{guest.phone}</span>
          </div>
        ) : null}
        {!guest.email && !guest.phone ? (
          <p className="text-sm text-muted-foreground">
            No contact details on file.
          </p>
        ) : null}

        {canManage && !isArchived ? (
          <GuestOfHonourToggle
            eventId={eventId}
            guestId={guestId}
            initial={guest.isGuestOfHonour}
          />
        ) : null}
      </section>

      <div className="mt-6">
        <GuestInviteStatusPanel
          eventId={eventId}
          guestId={guestId}
          guestStatus={guest.status}
          inviteTokenExpiresAt={guest.inviteTokenExpiresAt}
          inviteSentAt={guest.inviteSentAt}
          inviteEmailCount={guest.inviteEmailCount}
          lastAccessedAt={guest.lastAccessedAt}
          canManage={canManage}
        />
      </div>

      <GuestProfileSections
        eventId={eventId}
        rsvpSummary={rsvpSummary}
        paymentSummary={paymentSummary}
        activityRsvps={activityRsvps}
        paymentItems={paymentItems}
        recentActivity={recentActivity}
      />

      {!isArchived ? (
        <section className="mt-6">
          <GuestInviteLinkPanel
            eventId={eventId}
            guestId={guestId}
            initialInviteUrl={inviteUrl}
            canRegenerate={false}
          />
        </section>
      ) : (
        <section className="buxmate-card mt-6 p-6">
          <p className="text-sm text-muted-foreground">
            Invite link disabled for archived guests.
          </p>
        </section>
      )}

      <section className="buxmate-card mt-6 p-6">
        <h2 className="font-heading text-lg font-semibold">Archive</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Remove this guest from your active list and invalidate their invite
          link.
        </p>
        <div className="mt-4">
          <ArchiveGuestSection
            eventId={eventId}
            guestId={guestId}
            guestName={guest.name}
            status={guest.status}
          />
        </div>
      </section>
    </main>
  );
}
