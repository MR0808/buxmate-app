import Link from "next/link";
import { ArrowRight, Mail, Phone, Plus, Users } from "lucide-react";
import { EventStatus, GuestStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyInviteLinkButton } from "@/components/guests/copy-invite-link-button";
import { GuestStatusBadge } from "@/components/guests/guest-status-badge";
import { buildGuestInviteUrl } from "@/lib/guests/invite-url";
import { getOrganiserGuests } from "@/lib/guests";
import { getOrganiserEvent } from "@/lib/events";

export default async function EventGuestsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, guests] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserGuests(eventId),
  ]);

  const activeGuests = guests.filter((g) => g.status !== GuestStatus.ARCHIVED);
  const canAdd = event.status !== EventStatus.ARCHIVED;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            {event.name}
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold">Guests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeGuests.length} active
            {guests.length !== activeGuests.length
              ? ` · ${guests.length} total`
              : ""}
          </p>
        </div>
        {canAdd ? (
          <Button className="rounded-full normal-case tracking-normal" asChild>
            <Link href={`/events/${eventId}/guests/new`}>
              <Plus className="size-4" aria-hidden />
              Add guest
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-8">
        {guests.length > 0 ? (
          <div className="grid gap-4">
            {guests.map((guest) => {
              const inviteUrl = buildGuestInviteUrl(guest.inviteToken);
              const isArchived = guest.status === GuestStatus.ARCHIVED;

              return (
                <div
                  key={guest.id}
                  className="buxmate-card p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <GuestStatusBadge status={guest.status} />
                      </div>
                      <Link
                        href={`/events/${eventId}/guests/${guest.id}`}
                        className="mt-2 block font-heading text-lg font-semibold hover:text-primary"
                      >
                        {guest.name}
                      </Link>
                      {guest.email ? (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="size-3.5 shrink-0" aria-hidden />
                          {guest.email}
                        </p>
                      ) : null}
                      {guest.phone ? (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" aria-hidden />
                          {guest.phone}
                        </p>
                      ) : null}
                      {guest.lastAccessedAt ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Last opened{" "}
                          {guest.lastAccessedAt.toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                      {!isArchived ? (
                        <CopyInviteLinkButton inviteUrl={inviteUrl} />
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full normal-case tracking-normal"
                        asChild
                      >
                        <Link href={`/events/${eventId}/guests/${guest.id}`}>
                          Open
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full normal-case tracking-normal"
                        asChild
                      >
                        <Link href={`/events/${eventId}/guests/${guest.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No guests yet"
            description="No guests yet. Add your first guest and share their private invite link."
            action={
              canAdd ? (
                <Button className="rounded-full normal-case tracking-normal" asChild>
                  <Link href={`/events/${eventId}/guests/new`}>Add guest</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </main>
  );
}
