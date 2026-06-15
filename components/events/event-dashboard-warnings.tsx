import Link from "next/link";
import { Info } from "lucide-react";

type EventDashboardWarningsProps = {
  eventId: string;
  hasCosts: boolean;
  hasGuests: boolean;
  hasRsvps: boolean;
  hasInvites: boolean;
  needsReviewCount: number;
};

export function EventDashboardWarnings({
  eventId,
  hasCosts,
  hasGuests,
  hasRsvps,
  hasInvites,
  needsReviewCount,
}: EventDashboardWarningsProps) {
  const warnings: { message: string; href?: string; label?: string }[] = [];

  if (hasCosts && !hasGuests) {
    warnings.push({
      message:
        "You have costs set up but no guests yet. Add guests so payment splits can be calculated.",
      href: `/events/${eventId}/guests/new`,
      label: "Add guest",
    });
  }

  if (hasGuests && !hasInvites) {
    warnings.push({
      message:
        "Guests are added but no invites have been sent yet. Share invite links when you are ready.",
      href: `/events/${eventId}/guests`,
      label: "Manage guests",
    });
  }

  if (hasCosts && hasGuests && !hasRsvps) {
    warnings.push({
      message:
        "Costs are ready but no RSVPs yet. Remind guests to respond so activity costs stay accurate.",
      href: `/events/${eventId}/guests`,
      label: "View guests",
    });
  }

  if (needsReviewCount > 0) {
    warnings.push({
      message: `${needsReviewCount} payment allocation${needsReviewCount === 1 ? "" : "s"} may need a look after RSVP changes. Paid amounts are preserved.`,
      href: `/events/${eventId}/payments`,
      label: "Review payments",
    });
  }

  if (warnings.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 space-y-3">
      {warnings.map((warning) => (
        <div
          key={warning.message}
          className="flex gap-3 rounded-2xl border border-border/70 bg-brand-muted/40 p-4 text-sm"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-muted-foreground">{warning.message}</p>
            {warning.href && warning.label ? (
              <Link
                href={warning.href}
                className="mt-2 inline-block font-medium text-primary hover:underline"
              >
                {warning.label}
              </Link>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
