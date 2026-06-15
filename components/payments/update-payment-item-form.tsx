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
import { updatePaymentItem } from "@/lib/actions/payments";
import {
  updatePaymentItemSchema,
  type UpdatePaymentItemInput,
} from "@/lib/validations/payment";

type UpdatePaymentItemFormProps = {
  eventId: string;
  paymentItemId: string;
  initial: UpdatePaymentItemInput;
  cancelHref: string;
};

export function UpdatePaymentItemForm({
  eventId,
  paymentItemId,
  initial,
  cancelHref,
}: UpdatePaymentItemFormProps) {
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdatePaymentItemInput, string>>
  >({});
  const [form, setForm] = useState(initial);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = updatePaymentItemSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UpdatePaymentItemInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof UpdatePaymentItemInput]) {
          fieldErrors[key as keyof UpdatePaymentItemInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    start();
    const result = await updatePaymentItem(
      eventId,
      paymentItemId,
      parsed.data,
    );

    if (!result.success) {
      fail();
      toast.error(result.error);
      return;
    }

    toast.success("Payment item updated");
    succeed({ href: `/events/${eventId}/payments/${paymentItemId}` });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormBusyShell busy={isBusy} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-xl border border-border bg-card px-4"
        />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-h-24 rounded-xl border border-border bg-card px-4"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Amount and guest splits cannot be changed here. Create a new payment item
        if you need a different split.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          className="rounded-full normal-case tracking-normal"
          disabled={isBusy}
        >
          {submitLabel({
            idle: "Save changes",
            submitting: "Saving...",
          })}
        </Button>
        <Button variant="outline" className="rounded-full normal-case tracking-normal" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
      </FormBusyShell>
    </form>
  );
}
