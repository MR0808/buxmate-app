"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { createPaymentItem } from "@/lib/actions/payments";
import {
  ALLOCATION_MODES,
  createPaymentItemSchema,
  type AllocationMode,
  type CreatePaymentItemInput,
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePaymentItemInput, string>>
  >({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    activityId: "",
    allocationMode: "EQUAL_ALL_GUESTS" as AllocationMode,
  });

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
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

    setIsLoading(true);
    const result = await createPaymentItem(eventId, parsed.data);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Payment item created");
    router.push(`/events/${eventId}/payments/${result.paymentItemId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Accommodation share"
          className="rounded-xl border border-border bg-card px-4"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Total amount (AUD)</Label>
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
        <Label>Linked activity</Label>
        <Select
          value={form.activityId || "__none__"}
          onValueChange={(value) =>
            updateField("activityId", value === "__none__" ? "" : value)
          }
        >
          <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
            <SelectValue placeholder="No activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No activity</SelectItem>
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

      <div className="space-y-2">
        <Label>Split between</Label>
        <Select
          value={form.allocationMode}
          onValueChange={(value) =>
            updateField("allocationMode", value as AllocationMode)
          }
        >
          <SelectTrigger className="w-full rounded-xl border border-border bg-card px-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALLOCATION_MODES[0]}>
              All active guests (equal split)
            </SelectItem>
            <SelectItem value={ALLOCATION_MODES[1]}>
              Guests going to linked activity (equal split)
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.allocationMode ? (
          <p className="text-sm text-destructive">{errors.allocationMode}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          className="rounded-full normal-case tracking-normal"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create payment item"}
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
