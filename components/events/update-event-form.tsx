"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { EventStatus } from "@/generated/prisma/client";
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
import {
  EDITABLE_EVENT_STATUSES,
  EVENT_TYPES,
  updateEventSchema,
  type UpdateEventInput,
} from "@/lib/validations/event";
import { updateEvent } from "@/lib/actions/events";

type UpdateEventFormProps = {
  eventId: string;
  initial: {
    name: string;
    eventType: UpdateEventInput["eventType"];
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    status: Extract<EventStatus, "DRAFT" | "ACTIVE">;
  };
};

export function UpdateEventForm({ eventId, initial }: UpdateEventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateEventInput, string>>
  >({});
  const [form, setForm] = useState<UpdateEventInput>({
    name: initial.name,
    eventType: initial.eventType,
    location: initial.location,
    startDate: initial.startDate,
    endDate: initial.endDate,
    description: initial.description,
    status: initial.status,
  });

  function updateField<K extends keyof UpdateEventInput>(
    key: K,
    value: UpdateEventInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = updateEventSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UpdateEventInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof UpdateEventInput]) {
          fieldErrors[key as keyof UpdateEventInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const result = await updateEvent(eventId, parsed.data);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Event updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="rounded-xl border border-border bg-card px-4"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Event type</Label>
          <Select
            value={form.eventType}
            onValueChange={(value) =>
              updateField("eventType", value as UpdateEventInput["eventType"])
            }
          >
            <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.eventType ? (
            <p className="text-sm text-destructive">{errors.eventType}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) =>
              updateField("status", value as UpdateEventInput["status"])
            }
          >
            <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITABLE_EVENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "DRAFT" ? "Draft" : "Active"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Gold Coast, QLD"
          className="rounded-xl border border-border bg-card px-4"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => updateField("startDate", e.target.value)}
            className="rounded-xl border border-border bg-card px-4"
            aria-invalid={Boolean(errors.startDate)}
          />
          {errors.startDate ? (
            <p className="text-sm text-destructive">{errors.startDate}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            type="date"
            value={form.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
            className="rounded-xl border border-border bg-card px-4"
            aria-invalid={Boolean(errors.endDate)}
          />
          {errors.endDate ? (
            <p className="text-sm text-destructive">{errors.endDate}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="min-h-28 rounded-xl border border-border bg-card px-4"
        />
      </div>

      <Button
        type="submit"
        className="rounded-full normal-case tracking-normal"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
