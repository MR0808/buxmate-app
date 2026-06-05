"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    const result = await updatePaymentItem(
      eventId,
      paymentItemId,
      parsed.data,
    );
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Payment item updated");
    router.push(`/events/${eventId}/payments/${paymentItemId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" className="rounded-full normal-case tracking-normal" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
