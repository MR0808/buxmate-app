import Link from "next/link";
import { CalendarDays, CreditCard, History } from "lucide-react";
import { RsvpStatus } from "@/generated/prisma/client";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { formatActivityTimeRange } from "@/lib/activities/format";
import { formatMoney } from "@/lib/payments/format";
import { toAllocationPaymentStatus } from "@/lib/payments/status-labels";
import { RSVP_STATUS_LABELS, type GuestRsvpStatus } from "@/lib/rsvp-labels";

type GuestProfileSectionsProps = {
  eventId: string;
  rsvpSummary: {
    going: number;
    maybe: number;
    notGoing: number;
    pending: number;
    total: number;
  };
  paymentSummary: {
    owed: number;
    paid: number;
    outstanding: number;
  };
  activityRsvps: {
    activityId: string;
    title: string;
    startsAt: Date;
    endsAt: Date | null;
    status: RsvpStatus;
  }[];
  paymentItems: {
    id: string;
    title: string;
    owed: number;
    paid: number;
    outstanding: number;
    status: string;
  }[];
  recentActivity: {
    type: string;
    at: Date;
    label: string;
  }[];
};

const RSVP_BADGE_STATUS: Record<RsvpStatus, GuestRsvpStatus> = {
  GOING: "GOING",
  MAYBE: "MAYBE",
  NOT_GOING: "NOT_GOING",
  PENDING: "PENDING",
};

export function GuestProfileSections({
  eventId,
  rsvpSummary,
  paymentSummary,
  activityRsvps,
  paymentItems,
  recentActivity,
}: GuestProfileSectionsProps) {
  return (
    <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="buxmate-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" aria-hidden />
            <h2 className="font-heading text-lg font-semibold">RSVP summary</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-2xl font-semibold">{rsvpSummary.going}</p>
              <p className="text-muted-foreground">Going</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{rsvpSummary.pending}</p>
              <p className="text-muted-foreground">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{rsvpSummary.maybe}</p>
              <p className="text-muted-foreground">Maybe</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{rsvpSummary.notGoing}</p>
              <p className="text-muted-foreground">Can&apos;t make it</p>
            </div>
          </div>
        </div>

        <div className="buxmate-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" aria-hidden />
            <h2 className="font-heading text-lg font-semibold">Payment summary</h2>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-lg font-semibold">{formatMoney(paymentSummary.owed)}</p>
              <p className="text-muted-foreground">Share</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{formatMoney(paymentSummary.paid)}</p>
              <p className="text-muted-foreground">Paid</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                {formatMoney(paymentSummary.outstanding)}
              </p>
              <p className="text-muted-foreground">Owing</p>
            </div>
          </div>
        </div>
      </section>

      {activityRsvps.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-heading text-lg font-semibold">Activity RSVPs</h2>
          <div className="mt-4 space-y-3">
            {activityRsvps.map((activity) => (
              <div
                key={activity.activityId}
                className="buxmate-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/events/${eventId}/activities/${activity.activityId}`}
                    className="font-medium hover:text-primary"
                  >
                    {activity.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatActivityTimeRange(activity.startsAt, activity.endsAt)}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {
                    RSVP_STATUS_LABELS[RSVP_BADGE_STATUS[activity.status]]
                      .organiser
                  }
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {paymentItems.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-heading text-lg font-semibold">Payments</h2>
          <div className="mt-4 space-y-3">
            {paymentItems.map((item) => (
              <div
                key={item.id}
                className="buxmate-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatMoney(item.paid)} paid · {formatMoney(item.outstanding)} owing
                  </p>
                </div>
                <PaymentStatusBadge
                  status={toAllocationPaymentStatus(
                    item.outstanding === 0
                      ? "PAID"
                      : item.paid > 0
                        ? "PARTIAL"
                        : "PENDING",
                  )}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" aria-hidden />
          <h2 className="font-heading text-lg font-semibold">Recent activity</h2>
        </div>
        {recentActivity.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {recentActivity.map((item, index) => (
              <li
                key={`${item.type}-${item.at.toISOString()}-${index}`}
                className="buxmate-card flex items-center justify-between gap-4 p-4 text-sm"
              >
                <span>{item.label}</span>
                <time
                  dateTime={item.at.toISOString()}
                  className="shrink-0 text-muted-foreground"
                >
                  {item.at.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="buxmate-card mt-4 p-6 text-sm text-muted-foreground">
            No activity recorded yet.
          </p>
        )}
      </section>
    </>
  );
}
