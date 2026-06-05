import Link from "next/link";
import { UpdatePaymentItemForm } from "@/components/payments/update-payment-item-form";
import { getOrganiserPaymentItem } from "@/lib/payments";
import { getOrganiserEvent } from "@/lib/events";

export default async function EditPaymentItemPage({
  params,
}: {
  params: Promise<{ eventId: string; paymentItemId: string }>;
}) {
  const { eventId, paymentItemId } = await params;
  const [event, item] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserPaymentItem(eventId, paymentItemId),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Link
          href={`/events/${eventId}/payments/${paymentItemId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {item.title}
        </Link>
        <p className="mt-3 text-xs uppercase tracking-wider text-primary">
          {event.name}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">Edit payment</h1>
      </div>

      <div className="buxmate-card p-6 sm:p-8">
        <UpdatePaymentItemForm
          eventId={eventId}
          paymentItemId={paymentItemId}
          initial={{
            title: item.title,
            description: item.description ?? "",
          }}
          cancelHref={`/events/${eventId}/payments/${paymentItemId}`}
        />
      </div>
    </main>
  );
}
