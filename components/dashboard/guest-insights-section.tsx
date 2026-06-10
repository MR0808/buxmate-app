import Link from "next/link";
import { Users } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { formatMoney } from "@/lib/payments/format";
import type { GuestListItem } from "@/lib/guests/types";

type GuestInsightsSectionProps = {
  eventId: string;
  recentlyJoined: GuestListItem[];
  needingRsvp: GuestListItem[];
  outstandingPayments: GuestListItem[];
  neverOpened: GuestListItem[];
  canManage: boolean;
};

function GuestInsightList({
  guests,
  eventId,
  empty,
}: {
  guests: GuestListItem[];
  eventId: string;
  empty: string;
}) {
  if (guests.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="space-y-2">
      {guests.map((guest) => (
        <li key={guest.id}>
          <Link
            href={`/events/${eventId}/guests/${guest.id}`}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
          >
            <span className="truncate font-medium">{guest.name}</span>
            <span className="shrink-0 text-muted-foreground">
              {guest.email ?? "No email"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function GuestInsightsSection({
  eventId,
  recentlyJoined,
  needingRsvp,
  outstandingPayments,
  neverOpened,
  canManage,
}: GuestInsightsSectionProps) {
  const basePath = `/events/${eventId}/guests`;
  const hasInsights =
    recentlyJoined.length > 0 ||
    needingRsvp.length > 0 ||
    outstandingPayments.length > 0 ||
    neverOpened.length > 0;

  return (
    <DashboardSection
      title="Guest insights"
      description="Who needs your attention right now."
      action={{ label: "Manage guests", href: basePath }}
      empty={
        !hasInsights
          ? {
              icon: Users,
              title: "No guest insights yet",
              description: "Add guests and activity to see who needs a nudge.",
              action: canManage
                ? { label: "Add guest", href: `${basePath}/new` }
                : undefined,
            }
          : undefined
      }
    >
      {hasInsights ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="buxmate-card p-5">
            <h3 className="text-sm font-semibold">Recently joined</h3>
            <div className="mt-3">
              <GuestInsightList
                guests={recentlyJoined}
                eventId={eventId}
                empty="No one has joined yet."
              />
            </div>
          </div>
          <div className="buxmate-card p-5">
            <h3 className="text-sm font-semibold">Needs RSVP</h3>
            <div className="mt-3">
              <GuestInsightList
                guests={needingRsvp}
                eventId={eventId}
                empty="Everyone has responded."
              />
            </div>
          </div>
          <div className="buxmate-card p-5">
            <h3 className="text-sm font-semibold">Outstanding payments</h3>
            <div className="mt-3">
              {outstandingPayments.length > 0 ? (
                <ul className="space-y-2">
                  {outstandingPayments.map((guest) => (
                    <li key={guest.id}>
                      <Link
                        href={`/events/${eventId}/guests/${guest.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                      >
                        <span className="truncate font-medium">{guest.name}</span>
                        <span className="shrink-0 text-amber-700 dark:text-amber-400">
                          {formatMoney(guest.paymentSummary.outstanding)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">All caught up.</p>
              )}
            </div>
          </div>
          <div className="buxmate-card p-5">
            <h3 className="text-sm font-semibold">Never opened invite</h3>
            <div className="mt-3">
              <GuestInsightList
                guests={neverOpened}
                eventId={eventId}
                empty="Everyone has opened their invite."
              />
            </div>
          </div>
        </div>
      ) : null}
    </DashboardSection>
  );
}
