import Link from "next/link";
import { EventStatus } from "@/generated/prisma/client";
import { CreatePaymentItemForm } from "@/components/payments/create-payment-item-form";
import { getActiveActivitiesForPaymentForm } from "@/lib/payments";
import { getOrganiserEvent } from "@/lib/events";

export default async function NewPaymentItemPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, activities] = await Promise.all([
    getOrganiserEvent(eventId),
    getActiveActivitiesForPaymentForm(eventId),
  ]);

  if (event.status === EventStatus.ARCHIVED) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-muted-foreground">
          Cannot add payments to an archived event.{" "}
          <Link
            href={`/events/${eventId}/payments`}
            className="text-primary hover:underline"
          >
            Back to payments
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-primary">{event.name}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">Add payment</h1>
        <p className="mt-2 text-muted-foreground">
          Split a cost across guests. Mark payments as paid when money arrives.
        </p>
      </div>

      <div className="buxmate-card p-6 sm:p-8">
        <CreatePaymentItemForm
          eventId={eventId}
          activities={activities}
          cancelHref={`/events/${eventId}/payments`}
        />
      </div>
    </main>
  );
}
