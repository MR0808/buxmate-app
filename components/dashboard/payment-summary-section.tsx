import Link from "next/link";
import { CreditCard } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { formatMoney } from "@/lib/payments/format";
import type { EventCommandCentreData } from "@/lib/event-dashboard";

type PaymentSummarySectionProps = {
  eventId: string;
  payments: EventCommandCentreData["metrics"]["payments"];
  topOutstandingGuests: EventCommandCentreData["topOutstandingGuests"];
  canManage: boolean;
};

export function PaymentSummarySection({
  eventId,
  payments,
  topOutstandingGuests,
  canManage,
}: PaymentSummarySectionProps) {
  const basePath = `/events/${eventId}`;
  const hasPayments = payments.allocated > 0;
  const paidPercent =
    payments.allocated > 0
      ? Math.round((payments.paid / payments.allocated) * 100)
      : 0;

  return (
    <DashboardSection
      title="Payment summary"
      description={
        hasPayments
          ? `${paidPercent}% collected across guests`
          : "Track costs and who has paid."
      }
      action={
        hasPayments
          ? { label: "Manage payments", href: `${basePath}/payments` }
          : undefined
      }
      empty={
        !hasPayments
          ? {
              icon: CreditCard,
              title: "No payments tracked yet",
              description: "Add a payment item and split it across your guests.",
              action: canManage
                ? { label: "Add payment", href: `${basePath}/payments/new` }
                : undefined,
            }
          : undefined
      }
    >
      {hasPayments ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="buxmate-card p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Allocated
                </p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {formatMoney(payments.allocated)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Paid
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatMoney(payments.paid)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Outstanding
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-amber-700 dark:text-amber-400">
                  {formatMoney(payments.outstanding)}
                </p>
              </div>
            </div>
            <ProgressBar
              className="mt-5"
              value={payments.paid}
              max={payments.allocated}
              barClassName="bg-emerald-600 dark:bg-emerald-500"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {formatMoney(payments.paid)} of {formatMoney(payments.allocated)} collected
            </p>
          </div>

          {topOutstandingGuests.length > 0 ? (
            <div className="buxmate-card p-5 sm:p-6">
              <p className="text-sm font-medium">Top outstanding</p>
              <ul className="mt-4 space-y-3">
                {topOutstandingGuests.map((guest) => (
                  <li key={guest.guestId}>
                    <Link
                      href={`${basePath}/guests/${guest.guestId}`}
                      className="flex items-center justify-between gap-3 text-sm hover:text-primary"
                    >
                      <span className="truncate font-medium">{guest.name}</span>
                      <span className="shrink-0 font-medium text-amber-700 dark:text-amber-400">
                        {formatMoney(guest.outstanding)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="buxmate-card flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Everyone is up to date — nothing outstanding.
            </div>
          )}
        </div>
      ) : null}
    </DashboardSection>
  );
}
