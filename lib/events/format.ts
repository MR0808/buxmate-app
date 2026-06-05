import { format } from "date-fns";

export function formatEventDate(date: Date | null | undefined): string {
  if (!date) return "Not set";
  return format(date, "d MMM yyyy");
}

export function formatEventDateRange(
  startsAt: Date | null | undefined,
  endsAt: Date | null | undefined,
): string {
  if (!startsAt) return "Dates not set";
  if (!endsAt) return formatEventDate(startsAt);
  if (startsAt.toDateString() === endsAt.toDateString()) {
    return formatEventDate(startsAt);
  }
  return `${format(startsAt, "d MMM")} – ${format(endsAt, "d MMM yyyy")}`;
}

export function formatCreatedDate(date: Date): string {
  return format(date, "d MMM yyyy");
}
