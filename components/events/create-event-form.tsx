"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormBusyShell } from "@/components/shared/form-busy-shell";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
import { Shield } from "lucide-react";
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
  createEventSchema,
  EVENT_TYPES,
  type CreateEventInput,
} from "@/lib/validations/event";
import { createEvent } from "@/lib/actions/events";
import { trackEvent } from "@/lib/analytics";

export function CreateEventForm() {
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateEventInput, string>>
  >({});
  const [form, setForm] = useState<CreateEventInput>({
    name: "",
    eventType: "Bucks party",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  function updateField<K extends keyof CreateEventInput>(
    key: K,
    value: CreateEventInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createEventSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CreateEventInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof CreateEventInput]) {
          fieldErrors[key as keyof CreateEventInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    start();
    const result = await createEvent(parsed.data);

    if (!result.success) {
      fail();
      toast.error(result.error);
      return;
    }

    trackEvent("event_created", { event_category: "event" });
    toast.success("Event created");
    succeed({ href: `/events/${result.eventId}` });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormBusyShell busy={isBusy} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Dave's Bucks Weekend"
          className="rounded-xl border border-border bg-card px-4"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Event type</Label>
        <Select
          value={form.eventType}
          onValueChange={(value) =>
            updateField("eventType", value as CreateEventInput["eventType"])
          }
        >
          <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
            <SelectValue placeholder="Choose event type" />
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
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
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
            required
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
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
            onChange={(event) => updateField("endDate", event.target.value)}
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
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="A quick note about the weekend — optional but helpful for guests."
          className="min-h-28 rounded-xl border border-border bg-card px-4"
        />
      </div>

      <div className="flex gap-3 rounded-2xl border border-border/70 bg-brand-muted/50 p-4 text-sm text-muted-foreground">
        <Shield className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          Events are private by default. Only guests with an invite link can
          view details. You can generate invite links after creating the event.
        </p>
      </div>

      <Button
        type="submit"
        className="h-11 rounded-full px-8 normal-case tracking-normal"
        disabled={isBusy}
      >
        {submitLabel({
          idle: "Create event",
          submitting: "Creating event...",
        })}
      </Button>
      </FormBusyShell>
    </form>
  );
}
