import { CreditCard } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { formatMoney } from "@/lib/payments/format";
import {
  toAllocationPaymentStatus,
} from "@/lib/payments/status-labels";

type GuestPaymentsSectionProps = {
  summary: {
    allocated: number;
    paid: number;
    outstanding: number;
  };
  allocations: {
    id: string;
    amountCents: number;
    amountPaidCents: number;
    status: string;
    paymentItem: {
      title: string;
      description: string | null;
      activity: { title: string } | null;
    };
  }[];
  paymentInstructions: string | null;
};

export function GuestPaymentsSection({
  summary,
  allocations,
  paymentInstructions,
}: GuestPaymentsSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">Payments</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What you owe for this event.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="buxmate-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Your share
          </p>
          <p className="mt-1 font-heading text-xl font-semibold">
            {formatMoney(summary.allocated)}
          </p>
        </div>
        <div className="buxmate-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Paid
          </p>
          <p className="mt-1 font-heading text-xl font-semibold">
            {formatMoney(summary.paid)}
          </p>
        </div>
        <div className="buxmate-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Still owing
          </p>
          <p className="mt-1 font-heading text-xl font-semibold text-primary">
            {formatMoney(summary.outstanding)}
          </p>
        </div>
      </div>

      {allocations.length > 0 ? (
        <div className="mt-4 space-y-3">
          {allocations.map((allocation) => {
            const status = toAllocationPaymentStatus(
              allocation.status as "PENDING" | "PARTIAL" | "PAID" | "WAIVED",
            );
            const owing = Math.max(
              0,
              allocation.amountCents - allocation.amountPaidCents,
            );

            return (
              <article key={allocation.id} className="buxmate-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{allocation.paymentItem.title}</h3>
                    {allocation.paymentItem.activity ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {allocation.paymentItem.activity.title}
                      </p>
                    ) : null}
                  </div>
                  <PaymentStatusBadge status={status} audience="guest" />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Your share</dt>
                    <dd className="font-medium">
                      {formatMoney(allocation.amountCents)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Still owing</dt>
                    <dd className="font-medium">{formatMoney(owing)}</dd>
                  </div>
                </dl>
                {allocation.paymentItem.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {allocation.paymentItem.description}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="buxmate-card mt-4 p-6 text-sm text-muted-foreground">
          No payment items have been added for you yet.
        </p>
      )}

      <div className="buxmate-card mt-4 flex gap-3 p-4 text-sm text-muted-foreground">
        <CreditCard className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-medium text-foreground">How to pay</p>
          <p className="mt-1">
            {paymentInstructions?.trim()
              ? paymentInstructions
              : "Payment instructions from your organiser will appear here. Send money directly to the organiser — Buxmate does not process payments yet."}
          </p>
        </div>
      </div>
    </section>
  );
}
