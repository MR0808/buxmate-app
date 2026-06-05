import { EventStatus } from "@/generated/prisma/client";
import { ArchiveEventSection } from "@/components/events/archive-event-section";
import { UpdateEventForm } from "@/components/events/update-event-form";
import { getOrganiserEvent } from "@/lib/events";
import type { UpdateEventInput } from "@/lib/validations/event";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getOrganiserEvent(eventId);
  const isArchived = event.status === EventStatus.ARCHIVED;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold">Event settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit event details or archive when finished
        </p>
      </div>

      <section className="buxmate-card mb-6 space-y-3 p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Event slug
          </p>
          <p className="mt-1 font-mono text-sm">{event.slug}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Used for guest links — does not change when you edit the name.
          </p>
        </div>
      </section>

      {isArchived ? (
        <ArchiveEventSection
          eventId={event.id}
          eventName={event.name}
          status={event.status}
        />
      ) : (
        <>
          <section className="buxmate-card p-6 sm:p-8">
            <UpdateEventForm
              eventId={event.id}
              initial={{
                name: event.name,
                eventType: event.eventType as UpdateEventInput["eventType"],
                location: event.location ?? "",
                startDate: toDateInputValue(event.startsAt),
                endDate: toDateInputValue(event.endsAt),
                description: event.description ?? "",
                status:
                  event.status === EventStatus.DRAFT
                    ? EventStatus.DRAFT
                    : EventStatus.ACTIVE,
              }}
            />
          </section>

          <div className="mt-8">
            <ArchiveEventSection
              eventId={event.id}
              eventName={event.name}
              status={event.status}
            />
          </div>
        </>
      )}
    </main>
  );
}
