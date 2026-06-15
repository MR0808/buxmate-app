import { CreditCard } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { formatMoney } from "@/lib/payments/format";
import { toAllocationPaymentStatus } from "@/lib/payments/status-labels";

type GuestPaymentsSectionProps = {
  summary: {
    allocated: number;
    paid: number;
    outstanding: number;
  };
  activityAllocations: {
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
  sharedAllocations: {
    id: string;
    amountCents: number;
    amountPaidCents: number;
    status: string;
    paymentItem: {
      title: string;
      description: string | null;
    };
  }[];
  paymentInstructions: string | null;
};

function AllocationRow({
  title,
  subtitle,
  amountCents,
  amountPaidCents,
  status,
}: {
  title: string;
  subtitle?: string | null;
  amountCents: number;
  amountPaidCents: number;
  status: string;
}) {
  const paymentStatus = toAllocationPaymentStatus(
    status as "PENDING" | "PARTIAL" | "PAID" | "WAIVED",
  );
  const owing = Math.max(0, amountCents - amountPaidCents);

  return (
    <article className="buxmate-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <PaymentStatusBadge status={paymentStatus} audience="guest" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Your share</dt>
          <dd className="font-medium">{formatMoney(amountCents)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Still owing</dt>
          <dd className="font-medium">{formatMoney(owing)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function GuestPaymentsSection({
  summary,
  activityAllocations,
  sharedAllocations,
  paymentInstructions,
}: GuestPaymentsSectionProps) {
  const hasAllocations =
    activityAllocations.length > 0 || sharedAllocations.length > 0;

  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">Payments</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your share of activity and shared costs for this event.
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

      {hasAllocations ? (
        <div className="mt-6 space-y-6">
          {activityAllocations.length > 0 ? (
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Activity costs
              </h3>
              <div className="mt-3 space-y-3">
                {activityAllocations.map((allocation) => (
                  <AllocationRow
                    key={allocation.id}
                    title={allocation.paymentItem.title}
                    subtitle={allocation.paymentItem.activity?.title}
                    amountCents={allocation.amountCents}
                    amountPaidCents={allocation.amountPaidCents}
                    status={allocation.status}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {sharedAllocations.length > 0 ? (
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Shared costs
              </h3>
              <div className="mt-3 space-y-3">
                {sharedAllocations.map((allocation) => (
                  <AllocationRow
                    key={allocation.id}
                    title={allocation.paymentItem.title}
                    amountCents={allocation.amountCents}
                    amountPaidCents={allocation.amountPaidCents}
                    status={allocation.status}
                  />
                ))}
              </div>
            </div>
          ) : null}
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
