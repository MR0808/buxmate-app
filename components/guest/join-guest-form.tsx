"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinEventAsGuest } from "@/lib/actions/guest-access";
import { trackEvent } from "@/lib/analytics";
import {
  guestFieldsSchema,
  type CreateGuestInput,
} from "@/lib/validations/guest";

type JoinGuestFormProps = {
  inviteToken: string;
  initial: CreateGuestInput;
};

export function JoinGuestForm({ inviteToken, initial }: JoinGuestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateGuestInput, string>>
  >({});
  const [form, setForm] = useState<CreateGuestInput>(initial);

  function updateField<K extends keyof CreateGuestInput>(
    key: K,
    value: CreateGuestInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = guestFieldsSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CreateGuestInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof CreateGuestInput]) {
          fieldErrors[key as keyof CreateGuestInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const result = await joinEventAsGuest(inviteToken, parsed.data);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    trackEvent("guest_joined", {
      event_category: "guest",
      method: "invite",
    });
    router.push(`/e/${result.eventSlug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <p className="text-sm font-medium text-foreground">Your details</p>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
          className="h-12 rounded-xl border border-border bg-card px-4 text-base"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="Optional"
          className="h-12 rounded-xl border border-border bg-card px-4 text-base"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="Optional"
          className="h-12 rounded-xl border border-border bg-card px-4 text-base"
        />
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-full text-base normal-case tracking-normal"
        disabled={isLoading}
      >
        {isLoading ? "Continuing..." : "Continue to Event"}
      </Button>
    </form>
  );
}
