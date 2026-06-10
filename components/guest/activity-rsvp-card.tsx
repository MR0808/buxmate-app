"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatActivityCost,
  formatActivityTimeRange,
} from "@/lib/activities/format";
import { submitActivityRsvp } from "@/lib/actions/guest-access";
import { trackEvent } from "@/lib/analytics";
import {
  RSVP_STATUS_LABELS,
  type GuestRsvpStatus,
} from "@/lib/rsvp-labels";

type ActivityRsvpCardProps = {
  eventSlug: string;
  activity: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startsAt: Date | string;
    endsAt: Date | string | null;
    costCents: number;
    rsvpStatus: GuestRsvpStatus;
  };
  variant?: "default" | "timeline";
};

const RSVP_CHOICES = [
  { status: "GOING" as const, label: "Going" },
  { status: "MAYBE" as const, label: "Maybe" },
  { status: "NOT_GOING" as const, label: "Can't make it" },
];

export function ActivityRsvpCard({
  eventSlug,
  activity,
  variant = "default",
}: ActivityRsvpCardProps) {
  const [status, setStatus] = useState(activity.rsvpStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRsvp(next: "GOING" | "MAYBE" | "NOT_GOING") {
    setIsLoading(true);
    const result = await submitActivityRsvp(eventSlug, activity.id, next);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    trackEvent("rsvp_submitted", {
      event_category: "guest",
      status: next,
    });
    setStatus(next);
    toast.success("RSVP saved");
  }

  const isTimeline = variant === "timeline";

  return (
    <article className="buxmate-card p-5 sm:p-6">
      {!isTimeline ? (
        <>
          <h3 className="font-heading text-lg font-semibold">{activity.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatActivityTimeRange(activity.startsAt, activity.endsAt)}
          </p>
        </>
      ) : null}
      {activity.location ? (
        <p
          className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground",
            isTimeline ? "mt-0" : "mt-1",
          )}
        >
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {activity.location}
        </p>
      ) : null}
      {activity.description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {activity.description}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-medium">
        {formatActivityCost(activity.costCents)}
      </p>

      <div className="mt-5">
        <p className="text-sm font-medium">Can you make it?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Current: {RSVP_STATUS_LABELS[status].guest}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {RSVP_CHOICES.map((choice) => {
            const isSelected = status === choice.status;
            return (
              <Button
                key={choice.status}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "h-12 rounded-full text-base normal-case tracking-normal",
                  isSelected && "ring-2 ring-primary/30",
                )}
                disabled={isLoading}
                onClick={() => handleRsvp(choice.status)}
              >
                {choice.label}
              </Button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
