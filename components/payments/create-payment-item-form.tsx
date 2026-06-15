"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { FormBusyShell } from "@/components/shared/form-busy-shell";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PaymentAllocationPreviewPanel } from "@/components/payments/payment-allocation-preview";
import { createPaymentItem, previewPaymentItem } from "@/lib/actions/payments";
import { trackEvent } from "@/lib/analytics";
import type { PaymentAllocationPreview } from "@/lib/payments/preview";
import {
  ALLOCATION_METHODS,
  PAYMENT_COST_SCOPES,
  createPaymentItemSchema,
  type AllocationMethod,
  type CreatePaymentItemInput,
  type PaymentCostScopeInput,
} from "@/lib/validations/payment";

type ActivityOption = {
  id: string;
  title: string;
};

type CreatePaymentItemFormProps = {
  eventId: string;
  activities: ActivityOption[];
  cancelHref: string;
};

export function CreatePaymentItemForm({
  eventId,
  activities,
  cancelHref,
}: CreatePaymentItemFormProps) {
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePaymentItemInput, string>>
  >({});
  const [preview, setPreview] = useState<PaymentAllocationPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    costScope: "EVENT_WIDE" as PaymentCostScopeInput,
    activityId: "",
    allocationMethod: "ALL_ACTIVE_GUESTS" as AllocationMethod,
    excludeGuestOfHonour: false,
  });

  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedulePreview = useCallback(
    (nextForm: typeof form) => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }

      previewTimerRef.current = setTimeout(async () => {
        const parsed = createPaymentItemSchema.safeParse({
          ...nextForm,
          activityId: nextForm.activityId || undefined,
        });

        if (!parsed.success) {
          setPreview(null);
          setPreviewLoading(false);
          return;
        }

        setPreviewLoading(true);
        const result = await previewPaymentItem(eventId, parsed.data);
        setPreviewLoading(false);

        if (result.success) {
          setPreview(result.preview);
        } else {
          setPreview(null);
        }
      }, 400);
    },
    [eventId],
  );

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      schedulePreview(next);
      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createPaymentItemSchema.safeParse({
      ...form,
      activityId: form.activityId || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CreatePaymentItemInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof CreatePaymentItemInput]) {
          fieldErrors[key as keyof CreatePaymentItemInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    start();
    const result = await createPaymentItem(eventId, parsed.data);

    if (!result.success) {
      fail();
      toast.error(result.error);
      return;
    }

    trackEvent("payment_item_created", { event_category: "payment" });
    toast.success("Payment item created");
    succeed({
      href: `/events/${eventId}/payments/${result.paymentItemId}`,
    });
  }

  const showActivitySelect =
    form.costScope === "ACTIVITY" ||
    form.allocationMethod === "ACTIVITY_GOING_GUESTS";

  const showExcludeHonour =
    form.allocationMethod === "ALL_ACTIVE_GUESTS" ||
    form.allocationMethod === "ACTIVITY_GOING_GUESTS";

  return (
    <form onSubmit={handleSubmit}>
      <FormBusyShell busy={isBusy} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Group gift for Dave"
            className="rounded-xl border border-border bg-card px-4"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (AUD)</Label>
          <Input
            id="amount"
            type="number"
            min={0.01}
            step="0.01"
            value={form.amount}
            onChange={(e) => updateField("amount", e.target.value)}
            placeholder="500"
            className="rounded-xl border border-border bg-card px-4"
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount ? (
            <p className="text-sm text-destructive">{errors.amount}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Optional note for guests"
            className="min-h-24 rounded-xl border border-border bg-card px-4"
          />
        </div>

        <div className="space-y-2">
          <Label>Cost scope</Label>
          <Select
            value={form.costScope}
            onValueChange={(value) =>
              updateField("costScope", value as PaymentCostScopeInput)
            }
          >
            <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PAYMENT_COST_SCOPES[1]}>
                Event-wide shared cost
              </SelectItem>
              <SelectItem value={PAYMENT_COST_SCOPES[0]}>
                Linked to an activity
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showActivitySelect ? (
          <div className="space-y-2">
            <Label>Linked activity</Label>
            <Select
              value={form.activityId || "__none__"}
              onValueChange={(value) =>
                updateField("activityId", value === "__none__" ? "" : value)
              }
            >
              <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select activity</SelectItem>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activityId ? (
              <p className="text-sm text-destructive">{errors.activityId}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Allocation method</Label>
          <Select
            value={form.allocationMethod}
            onValueChange={(value) =>
              updateField("allocationMethod", value as AllocationMethod)
            }
          >
            <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALLOCATION_METHODS[0]}>
                All active guests (equal split)
              </SelectItem>
              <SelectItem value={ALLOCATION_METHODS[1]}>
                All active guests excluding guest of honour
              </SelectItem>
              <SelectItem value={ALLOCATION_METHODS[2]}>
                Guests going to linked activity (equal split)
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.allocationMethod ? (
            <p className="text-sm text-destructive">{errors.allocationMethod}</p>
          ) : null}
        </div>

        {showExcludeHonour ? (
          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-4">
            <Checkbox
              checked={form.excludeGuestOfHonour}
              onCheckedChange={(checked) =>
                updateField("excludeGuestOfHonour", checked === true)
              }
            />
            <span className="text-sm">
              <span className="font-medium">Also exclude guest of honour</span>
              <span className="mt-0.5 block text-muted-foreground">
                Useful for group gifts and shared extras.
              </span>
            </span>
          </label>
        ) : null}

        <PaymentAllocationPreviewPanel
          preview={preview}
          loading={previewLoading}
        />

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            className="rounded-full normal-case tracking-normal"
            disabled={isBusy}
          >
            {submitLabel({
              idle: "Create payment item",
              submitting: "Creating...",
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
