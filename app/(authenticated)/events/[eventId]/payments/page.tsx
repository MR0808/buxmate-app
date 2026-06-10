import Link from "next/link";
import { ArrowRight, CreditCard, Plus } from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { formatMoney } from "@/lib/payments/format";
import { toAllocationPaymentStatus } from "@/lib/payments/status-labels";
import { summariseAllocations, getOrganiserPaymentsPageData } from "@/lib/payments";
import { SendPaymentReminderButton } from "@/components/emails/send-payment-reminder-button";
import { getOrganiserEvent } from "@/lib/events";

export default async function EventPaymentsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, data] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserPaymentsPageData(eventId),
  ]);

  const canAdd = event.status !== EventStatus.ARCHIVED;
  const { paymentItems, guestBalances, summary } = data;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            {event.name}
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold">Payments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track who owes what — no card processing yet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.outstanding > 0 && canAdd ? (
            <SendPaymentReminderButton eventId={eventId} mode="bulk" />
          ) : null}
          {canAdd ? (
            <Button className="rounded-full normal-case tracking-normal" asChild>
              <Link href={`/events/${eventId}/payments/new`}>
                <Plus className="size-4" aria-hidden />
                Add payment
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total cost"
          value={formatMoney(summary.totalCost)}
          hint="Sum of payment items"
          icon={CreditCard}
        />
        <StatCard
          label="Allocated"
          value={formatMoney(summary.allocated)}
          hint="Split across guests"
          icon={CreditCard}
        />
        <StatCard
          label="Paid"
          value={formatMoney(summary.paid)}
          icon={CreditCard}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding)}
          icon={CreditCard}
        />
      </section>

      <section className="mt-10">
        <h3 className="font-heading text-lg font-semibold">Payment items</h3>
        {paymentItems.length > 0 ? (
          <div className="mt-4 grid gap-4">
            {paymentItems.map((item) => {
              const itemSummary = summariseAllocations(item.allocations);
              const paidCount = item.allocations.filter(
                (a) => a.status === "PAID" || a.amountPaidCents >= a.amountCents,
              ).length;

              return (
                <Link
                  key={item.id}
                  href={`/events/${eventId}/payments/${item.id}`}
                  className="buxmate-card block p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-heading text-lg font-semibold">
                        {item.title}
                      </h4>
                      {item.activity ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Linked to {item.activity.title}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm font-medium">
                        {formatMoney(item.amountCents)} total ·{" "}
                        {item.allocations.length} guests · {paidCount} paid
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatMoney(itemSummary.outstanding)} outstanding
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            icon={CreditCard}
            title="No payments yet"
            description="Track your first shared cost and split it across guests."
            action={
              canAdd ? (
                <Button className="rounded-full normal-case tracking-normal" asChild>
                  <Link href={`/events/${eventId}/payments/new`}>Add payment</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      {guestBalances.length > 0 ? (
        <section className="mt-10">
          <h3 className="font-heading text-lg font-semibold">Guest balances</h3>
          <div className="mt-4 space-y-3">
            {guestBalances.map((guest) => (
              <div
                key={guest.guestId}
                className="buxmate-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{guest.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Owed {formatMoney(guest.owed)} · Paid {formatMoney(guest.paid)} ·
                    Outstanding {formatMoney(guest.outstanding)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentStatusBadge
                    status={toAllocationPaymentStatus(
                      guest.paymentStatus as "PENDING" | "PARTIAL" | "PAID",
                    )}
                  />
                  {canAdd && guest.outstanding > 0 ? (
                    <SendPaymentReminderButton
                      eventId={eventId}
                      mode="guest"
                      guestId={guest.guestId}
                      guestName={guest.name}
                      outstandingCents={guest.outstanding}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
