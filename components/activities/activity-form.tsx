"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createActivity, updateActivity } from "@/lib/actions/activities";
import { trackEvent } from "@/lib/analytics";
import { createActivitySchema } from "@/lib/validations/activity";
import type { ActivityFormState } from "@/lib/activities/form-input";

type ActivityFormProps = {
  eventId: string;
  mode: "create" | "edit";
  activityId?: string;
  initial?: ActivityFormState;
  cancelHref: string;
};

const defaultValues: ActivityFormState = {
  name: "",
  description: "",
  location: "",
  startTime: "",
  endTime: "",
  cost: "",
};

export function ActivityForm({
  eventId,
  mode,
  activityId,
  initial,
  cancelHref,
}: ActivityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ActivityFormState, string>>
  >({});
  const [form, setForm] = useState<ActivityFormState>(initial ?? defaultValues);

  function updateField<K extends keyof ActivityFormState>(
    key: K,
    value: ActivityFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createActivitySchema.safeParse({
      ...form,
      cost: form.cost === "" || form.cost === undefined ? 0 : form.cost,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ActivityFormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof ActivityFormState]) {
          fieldErrors[key as keyof ActivityFormState] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    const result =
      mode === "create"
        ? await createActivity(eventId, parsed.data)
        : await updateActivity(eventId, activityId!, parsed.data);

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (mode === "create") {
      trackEvent("activity_created", { event_category: "activity" });
    }

    toast.success(mode === "create" ? "Activity created" : "Activity updated");

    if (mode === "create" && "activityId" in result) {
      router.push(`/events/${eventId}/activities/${result.activityId}`);
    } else {
      router.push(`/events/${eventId}/activities/${activityId}`);
    }
    router.refresh();
  }

  const costDisplay =
    typeof form.cost === "number"
      ? form.cost
      : form.cost === ""
        ? ""
        : Number(form.cost);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Activity name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Saturday paintball"
          className="rounded-xl border border-border bg-card px-4"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Surfers Paradise"
          className="rounded-xl border border-border bg-card px-4"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => updateField("startTime", e.target.value)}
            className="rounded-xl border border-border bg-card px-4"
            aria-invalid={Boolean(errors.startTime)}
          />
          {errors.startTime ? (
            <p className="text-sm text-destructive">{errors.startTime}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End time</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => updateField("endTime", e.target.value)}
            className="rounded-xl border border-border bg-card px-4"
            aria-invalid={Boolean(errors.endTime)}
          />
          {errors.endTime ? (
            <p className="text-sm text-destructive">{errors.endTime}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost">Cost per person (AUD)</Label>
        <Input
          id="cost"
          type="number"
          min={0}
          step="0.01"
          value={costDisplay}
          onChange={(e) =>
            updateField("cost", e.target.value === "" ? 0 : e.target.value)
          }
          placeholder="0"
          className="rounded-xl border border-border bg-card px-4"
          aria-invalid={Boolean(errors.cost)}
        />
        <p className="text-xs text-muted-foreground">
          Leave as 0 for free activities. Payment tracking comes later.
        </p>
        {errors.cost ? (
          <p className="text-sm text-destructive">{errors.cost}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="What guests need to know — optional."
          className="min-h-28 rounded-xl border border-border bg-card px-4"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          className="rounded-full normal-case tracking-normal"
          disabled={isLoading}
        >
          {isLoading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create activity"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full normal-case tracking-normal"
          asChild
        >
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
