import type { Metadata } from "next";
import Link from "next/link";
import { EventStatus } from "@/generated/prisma/client";
import { ActivityForm } from "@/components/activities/activity-form";
import { getOrganiserEvent } from "@/lib/events";

export const metadata: Metadata = {
  title: "Add activity",
};

export default async function NewActivityPage({
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
          Cannot add activities to an archived event.{" "}
          <Link href={`/events/${eventId}/activities`} className="text-primary hover:underline">
            Back to activities
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-primary">{event.name}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">Add activity</h1>
        <p className="mt-2 text-muted-foreground">
          Add an item to your event itinerary.
        </p>
      </div>

      <div className="buxmate-card p-6 sm:p-8">
        <ActivityForm
          eventId={eventId}
          mode="create"
          cancelHref={`/events/${eventId}/activities`}
        />
      </div>
    </main>
  );
}
