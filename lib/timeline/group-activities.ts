import { format } from "date-fns";

export type TimelineActivity = {
  id: string;
  title: string;
  startsAt: Date | string;
  endsAt?: Date | string | null;
};

export type TimelineDayGroup<T extends TimelineActivity> = {
  dayKey: string;
  dayLabel: string;
  activities: (T & { timeLabel: string })[];
};

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

export function formatTimelineTime(
  startsAt: Date | string,
  endsAt?: Date | string | null,
): string {
  const start = toDate(startsAt);
  if (!endsAt) {
    return format(start, "h:mm a");
  }

  const end = toDate(endsAt);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
  }

  return `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
}

export function groupActivitiesByDay<T extends TimelineActivity>(
  activities: T[],
): TimelineDayGroup<T>[] {
  const groups = new Map<string, TimelineDayGroup<T>>();

  for (const activity of activities) {
    const start = toDate(activity.startsAt);
    const dayKey = format(start, "yyyy-MM-dd");
    const dayLabel = format(start, "EEEE");
    const timeLabel = formatTimelineTime(activity.startsAt, activity.endsAt);

    const existing = groups.get(dayKey);
    const entry = { ...activity, timeLabel };

    if (existing) {
      existing.activities.push(entry);
    } else {
      groups.set(dayKey, {
        dayKey,
        dayLabel,
        activities: [entry],
      });
    }
  }

  return [...groups.values()];
}
