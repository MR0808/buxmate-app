"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { FormBusyShell } from "@/components/shared/form-busy-shell";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_COST_TYPES } from "@/lib/validations/activity";
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
  costType: "FREE",
  cost: "",
};

export function ActivityForm({
  eventId,
  mode,
  activityId,
  initial,
  cancelHref,
}: ActivityFormProps) {
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();
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

    start();

    const result =
      mode === "create"
        ? await createActivity(eventId, parsed.data)
        : await updateActivity(eventId, activityId!, parsed.data);

    if (!result.success) {
      fail();
      toast.error(result.error);
      return;
    }

    if (mode === "create") {
      trackEvent("activity_created", { event_category: "activity" });
    }

    toast.success(mode === "create" ? "Activity created" : "Activity updated");

    const href =
      mode === "create" && "activityId" in result
        ? `/events/${eventId}/activities/${result.activityId}`
        : `/events/${eventId}/activities/${activityId}`;
    succeed({ href });
  }

  const costDisplay =
    typeof form.cost === "number"
      ? form.cost
      : form.cost === ""
        ? ""
        : Number(form.cost);

  return (
    <form onSubmit={handleSubmit}>
      <FormBusyShell busy={isBusy} className="space-y-6">
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
        <Label>Cost type</Label>
        <Select
          value={form.costType}
          onValueChange={(value) =>
            updateField("costType", value as ActivityFormState["costType"])
          }
        >
          <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ACTIVITY_COST_TYPES[0]}>Free</SelectItem>
            <SelectItem value={ACTIVITY_COST_TYPES[1]}>
              Fixed per attending guest
            </SelectItem>
            <SelectItem value={ACTIVITY_COST_TYPES[2]}>
              Total split by attending guests
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.costType !== "FREE" ? (
        <div className="space-y-2">
          <Label htmlFor="cost">
            {form.costType === "FIXED_PER_ATTENDING_GUEST"
              ? "Cost per attending guest (AUD)"
              : "Total cost to split (AUD)"}
          </Label>
          <Input
            id="cost"
            type="number"
            min={0.01}
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
            {form.costType === "FIXED_PER_ATTENDING_GUEST"
              ? "Each guest marked Going will owe this amount."
              : "The total will be split equally among guests marked Going."}
          </p>
          {errors.cost ? (
            <p className="text-sm text-destructive">{errors.cost}</p>
          ) : null}
        </div>
      ) : null}

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
          disabled={isBusy}
        >
          {submitLabel({
            idle: mode === "create" ? "Create activity" : "Save changes",
            submitting: mode === "create" ? "Creating..." : "Saving...",
          })}
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
      </FormBusyShell>
    </form>
  );
}
