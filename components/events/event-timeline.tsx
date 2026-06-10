import Link from "next/link";
import { MapPin } from "lucide-react";
import { groupActivitiesByDay } from "@/lib/timeline/group-activities";
import { cn } from "@/lib/utils";

type TimelineActivityBase = {
  id: string;
  title: string;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  location?: string | null;
};

type EventTimelineProps<T extends TimelineActivityBase> = {
  activities: T[];
  className?: string;
  renderActivity?: (activity: T & { timeLabel: string }) => React.ReactNode;
  getActivityHref?: (activity: T) => string | undefined;
  showLocation?: boolean;
};

export function EventTimeline<T extends TimelineActivityBase>({
  activities,
  className,
  renderActivity,
  getActivityHref,
  showLocation = true,
}: EventTimelineProps<T>) {
  const days = groupActivitiesByDay(activities);

  if (days.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-8", className)}>
      {days.map((day) => (
        <div key={day.dayKey}>
          <h3 className="font-heading text-lg font-semibold">{day.dayLabel}</h3>
          <ol className="relative mt-4 space-y-0 border-l-2 border-primary/20 pl-5">
            {day.activities.map((activity, index) => {
              const href = getActivityHref?.(activity);
              const isLast = index === day.activities.length - 1;

              const content = renderActivity ? (
                renderActivity(activity)
              ) : (
                <div className={cn("pb-6", isLast && "pb-0")}>
                  <p className="text-sm font-medium text-primary">
                    {activity.timeLabel}
                  </p>
                  {href ? (
                    <Link
                      href={href}
                      className="mt-1 block font-medium hover:text-primary"
                    >
                      {activity.title}
                    </Link>
                  ) : (
                    <p className="mt-1 font-medium">{activity.title}</p>
                  )}
                  {showLocation && activity.location ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      {activity.location}
                    </p>
                  ) : null}
                </div>
              );

              return (
                <li key={activity.id} className="relative">
                  <span
                    className="absolute -left-[calc(1.25rem+1px)] top-1.5 size-2.5 rounded-full border-2 border-background bg-primary"
                    aria-hidden
                  />
                  {content}
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
