import Link from "next/link";
import { GuestStatus } from "@/generated/prisma/client";
import { GuestForm } from "@/components/guests/guest-form";
import { getOrganiserGuest } from "@/lib/guests";
import { getOrganiserEvent } from "@/lib/events";

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ eventId: string; guestId: string }>;
}) {
  const { eventId, guestId } = await params;
  const [event, guest] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserGuest(eventId, guestId),
  ]);

  if (guest.status === GuestStatus.ARCHIVED) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-muted-foreground">
          Archived guests cannot be edited.{" "}
          <Link
            href={`/events/${eventId}/guests/${guestId}`}
            className="text-primary hover:underline"
          >
            View guest
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Link
          href={`/events/${eventId}/guests/${guestId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {guest.name}
        </Link>
        <p className="mt-3 text-xs uppercase tracking-wider text-primary">
          {event.name}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">Edit guest</h1>
      </div>

      <div className="buxmate-card p-6 sm:p-8">
        <GuestForm
          eventId={eventId}
          guestId={guestId}
          mode="edit"
          initial={{
            name: guest.name,
            email: guest.email ?? "",
            phone: guest.phone ?? "",
          }}
          cancelHref={`/events/${eventId}/guests/${guestId}`}
        />
      </div>
    </main>
  );
}
