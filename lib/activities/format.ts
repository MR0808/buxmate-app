import { format } from "date-fns";

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

export function formatActivityDateTime(
  date: Date | string | null | undefined,
): string {
  if (!date) return "Not set";
  return format(toDate(date), "EEE d MMM yyyy · h:mm a");
}

export function formatActivityTimeRange(
  startsAt: Date | string,
  endsAt: Date | string | null | undefined,
): string {
  const start = toDate(startsAt);
  if (!endsAt) {
    return formatActivityDateTime(start);
  }
  const end = toDate(endsAt);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${format(start, "EEE d MMM yyyy · h:mm a")} – ${format(end, "h:mm a")}`;
  }
  return `${format(start, "d MMM h:mm a")} – ${format(end, "d MMM yyyy h:mm a")}`;
}

export function formatActivityCost(costCents: number): string {
  if (costCents <= 0) return "Free";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(costCents / 100);
}
