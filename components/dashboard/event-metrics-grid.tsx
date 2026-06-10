import {
  CalendarDays,
  Camera,
  CreditCard,
  ListTodo,
  MessageSquare,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatMoney } from "@/lib/payments/format";
import type { EventCommandCentreData } from "@/lib/event-dashboard";

type EventMetricsGridProps = {
  metrics: EventCommandCentreData["metrics"];
};

export function EventMetricsGrid({ metrics }: EventMetricsGridProps) {
  const { guests, activities, rsvps, payments, photos, announcements } =
    metrics;

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Guests"
        value={String(guests.total)}
        hint={`${guests.joined} joined`}
        icon={Users}
      />
      <StatCard
        label="Activities"
        value={String(activities.active)}
        hint={
          activities.nextTitle
            ? `Next: ${activities.nextTitle}`
            : `${activities.total} total`
        }
        icon={ListTodo}
      />
      <StatCard
        label="RSVPs"
        value={String(rsvps.responded)}
        hint={`${rsvps.pending} pending`}
        icon={CalendarDays}
      />
      <StatCard
        label="Outstanding"
        value={formatMoney(payments.outstanding)}
        hint={`${formatMoney(payments.paid)} paid`}
        icon={CreditCard}
      />
      <StatCard
        label="Photos"
        value={String(photos.total)}
        hint="In event gallery"
        icon={Camera}
      />
      <StatCard
        label="Updates"
        value={String(announcements.total)}
        hint="Posts on feed"
        icon={MessageSquare}
      />
    </section>
  );
}
