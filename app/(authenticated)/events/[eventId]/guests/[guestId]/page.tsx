import Link from "next/link";
import { Mail, Pencil, Phone } from "lucide-react";
import { GuestStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ArchiveGuestSection } from "@/components/guests/archive-guest-section";
import { GuestInviteLinkPanel } from "@/components/guests/guest-invite-link-panel";
import { GuestStatusBadge } from "@/components/guests/guest-status-badge";
import { buildGuestInviteUrl } from "@/lib/guests/invite-url";
import { getOrganiserGuest } from "@/lib/guests";
import { getOrganiserEvent } from "@/lib/events";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; guestId: string }>;
}) {
  const { eventId, guestId } = await params;
  const [event, guest] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserGuest(eventId, guestId),
  ]);

  const isArchived = guest.status === GuestStatus.ARCHIVED;
  const inviteUrl = buildGuestInviteUrl(guest.inviteToken);

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
          </div>
        </div>
        {!isArchived ? (
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
        ) : null}
      </div>

      <section className="buxmate-card space-y-4 p-6 sm:p-8">
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

        {guest.lastAccessedAt ? (
          <p className="text-xs text-muted-foreground">
            Last opened invite{" "}
            {guest.lastAccessedAt.toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          RSVP tracking will connect to this guest in a future update.
        </p>
      </section>

      {!isArchived ? (
        <section className="mt-6">
          <GuestInviteLinkPanel
            eventId={eventId}
            guestId={guestId}
            initialInviteUrl={inviteUrl}
            canRegenerate
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
