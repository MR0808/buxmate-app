import type { ActivityCostType } from "@/generated/prisma/client";
import { centsToDollars, toDateTimeLocalValue } from "@/lib/validations/activity";
import type { ActivityCostTypeInput } from "@/lib/validations/activity";

export type ActivityFormState = {
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  costType: ActivityCostTypeInput;
  cost: string | number;
};

export function activityToFormInput(activity: {
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  costCents: number;
  costType: ActivityCostType;
}): ActivityFormState {
  return {
    name: activity.title,
    description: activity.description ?? "",
    location: activity.location ?? "",
    startTime: toDateTimeLocalValue(activity.startsAt),
    endTime: toDateTimeLocalValue(activity.endsAt),
    costType: activity.costType,
    cost:
      activity.costCents > 0
        ? centsToDollars(activity.costCents).toFixed(2)
        : "",
  };
}
