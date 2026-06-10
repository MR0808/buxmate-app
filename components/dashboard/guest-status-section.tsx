import Link from "next/link";
import { Users } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import type { EventCommandCentreData } from "@/lib/event-dashboard";

type GuestStatusSectionProps = {
  eventId: string;
  guestStatus: EventCommandCentreData["guestStatus"];
  canManage: boolean;
};

const statusStyles = {
  joined: "bg-primary",
  invited: "bg-amber-500/80",
  declined: "bg-muted-foreground/40",
} as const;

export function GuestStatusSection({
  eventId,
  guestStatus,
  canManage,
}: GuestStatusSectionProps) {
  const { total, invited, joined, declined, archived } = guestStatus;
  const basePath = `/events/${eventId}`;

  return (
    <DashboardSection
      title="Guest status"
      description={
        total === 0
          ? "Invite guests and track who has joined."
          : `${total} guest${total === 1 ? "" : "s"} on this event`
      }
      action={
        total > 0
          ? { label: "Manage guests", href: `${basePath}/guests` }
          : undefined
      }
      empty={
        total === 0
          ? {
              icon: Users,
              title: "No guests yet",
              description: "Invite your first guest and share their private link.",
              action: canManage
                ? { label: "Add guest", href: `${basePath}/guests/new` }
                : undefined,
            }
          : undefined
      }
    >
      {total > 0 ? (
        <div className="buxmate-card p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-2xl font-semibold">{total}</p>
            <p className="text-sm text-muted-foreground">
              {joined} joined · {invited} invited
              {declined > 0 ? ` · ${declined} declined` : ""}
            </p>
          </div>

          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
            {joined > 0 ? (
              <div
                className={statusStyles.joined}
                style={{ width: `${(joined / total) * 100}%` }}
                title={`${joined} joined`}
              />
            ) : null}
            {invited > 0 ? (
              <div
                className={statusStyles.invited}
                style={{ width: `${(invited / total) * 100}%` }}
                title={`${invited} invited`}
              />
            ) : null}
            {declined > 0 ? (
              <div
                className={statusStyles.declined}
                style={{ width: `${(declined / total) * 100}%` }}
                title={`${declined} declined`}
              />
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">{joined}</span>
              </div>
              <ProgressBar
                className="mt-2"
                value={joined}
                max={total}
                barClassName="bg-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Invited</span>
                <span className="font-medium">{invited}</span>
              </div>
              <ProgressBar
                className="mt-2"
                value={invited}
                max={total}
                barClassName="bg-amber-500/80"
              />
            </div>
          </div>

          {archived > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {archived} archived guest{archived === 1 ? "" : "s"} not shown above.{" "}
              <Link href={`${basePath}/guests`} className="text-primary hover:underline">
                View guests
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </DashboardSection>
  );
}
