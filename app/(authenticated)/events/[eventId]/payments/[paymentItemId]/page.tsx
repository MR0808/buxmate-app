import Link from "next/link";
import { Pencil } from "lucide-react";
import { PaymentStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { AllocationActions } from "@/components/payments/allocation-actions";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { formatMoney } from "@/lib/payments/format";
import { toAllocationPaymentStatus } from "@/lib/payments/status-labels";
import { getOrganiserPaymentItem, summariseAllocations } from "@/lib/payments";
import { getOrganiserEvent } from "@/lib/events";

export default async function PaymentItemDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; paymentItemId: string }>;
}) {
  const { eventId, paymentItemId } = await params;
  const [event, item] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserPaymentItem(eventId, paymentItemId),
  ]);

  const itemSummary = summariseAllocations(item.allocations);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/events/${eventId}/payments`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Payments
          </Link>
          <p className="mt-2 text-xs uppercase tracking-wider text-primary">
            {event.name}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
            {item.title}
          </h1>
          {item.activity ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Linked to {item.activity.title}
            </p>
          ) : null}
        </div>
        <Button
          variant="outline"
          className="shrink-0 rounded-full normal-case tracking-normal"
          asChild
        >
          <Link href={`/events/${eventId}/payments/${paymentItemId}/edit`}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Link>
        </Button>
      </div>

      <section className="buxmate-card p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Total
            </dt>
            <dd className="mt-1 font-medium">{formatMoney(item.amountCents)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Allocated
            </dt>
            <dd className="mt-1 font-medium">
              {formatMoney(itemSummary.allocated)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Paid
            </dt>
            <dd className="mt-1 font-medium">{formatMoney(itemSummary.paid)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Outstanding
            </dt>
            <dd className="mt-1 font-medium text-primary">
              {formatMoney(itemSummary.outstanding)}
            </dd>
          </div>
        </dl>
        {item.description ? (
          <p className="mt-4 text-sm text-muted-foreground">{item.description}</p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Guest splits</h2>
        <div className="mt-4 space-y-3">
          {item.allocations.map((allocation) => {
            const isPaid =
              allocation.status === PaymentStatus.PAID ||
              allocation.amountPaidCents >= allocation.amountCents;
            const status = toAllocationPaymentStatus(allocation.status);

            return (
              <div
                key={allocation.id}
                className="buxmate-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{allocation.guest.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Owed {formatMoney(allocation.amountCents)} · Paid{" "}
                    {formatMoney(allocation.amountPaidCents)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentStatusBadge status={status} />
                  <AllocationActions
                    eventId={eventId}
                    allocationId={allocation.id}
                    isPaid={isPaid}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
