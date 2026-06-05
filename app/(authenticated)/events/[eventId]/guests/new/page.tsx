import Link from "next/link";
import { EventStatus } from "@/generated/prisma/client";
import { GuestForm } from "@/components/guests/guest-form";
import { getOrganiserEvent } from "@/lib/events";

export default async function NewGuestPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getOrganiserEvent(eventId);

  if (event.status === EventStatus.ARCHIVED) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-muted-foreground">
          Cannot add guests to an archived event.{" "}
          <Link
            href={`/events/${eventId}/guests`}
            className="text-primary hover:underline"
          >
            Back to guests
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-primary">{event.name}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">Add guest</h1>
        <p className="mt-2 text-muted-foreground">
          A private invite link is created automatically. Copy and share it with
          your guest.
        </p>
      </div>

      <div className="buxmate-card p-6 sm:p-8">
        <GuestForm
          eventId={eventId}
          mode="create"
          cancelHref={`/events/${eventId}/guests`}
        />
      </div>
    </main>
  );
}
