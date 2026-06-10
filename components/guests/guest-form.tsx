"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGuest, updateGuest } from "@/lib/actions/guests";
import { trackEvent } from "@/lib/analytics";
import {
  createGuestSchema,
  type CreateGuestInput,
} from "@/lib/validations/guest";

type GuestFormProps = {
  eventId: string;
  mode: "create" | "edit";
  guestId?: string;
  initial?: CreateGuestInput;
  cancelHref: string;
};

const defaultValues: CreateGuestInput = {
  name: "",
  email: "",
  phone: "",
};

export function GuestForm({
  eventId,
  mode,
  guestId,
  initial,
  cancelHref,
}: GuestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateGuestInput, string>>
  >({});
  const [form, setForm] = useState<CreateGuestInput>(initial ?? defaultValues);

  function updateField<K extends keyof CreateGuestInput>(
    key: K,
    value: CreateGuestInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createGuestSchema.safeParse(form);
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

    const result =
      mode === "create"
        ? await createGuest(eventId, parsed.data)
        : await updateGuest(eventId, guestId!, parsed.data);

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (mode === "create") {
      trackEvent("guest_added", {
        event_category: "guest",
        source: "form",
        count: 1,
      });
    }

    toast.success(mode === "create" ? "Guest added" : "Guest updated");

    if (mode === "create" && "guestId" in result) {
      router.push(`/events/${eventId}/guests/${result.guestId}`);
    } else {
      router.push(`/events/${eventId}/guests/${guestId}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Dave Smith"
          className="rounded-xl border border-border bg-card px-4"
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
          placeholder="dave@example.com"
          className="rounded-xl border border-border bg-card px-4"
          aria-invalid={Boolean(errors.email)}
        />
        <p className="text-xs text-muted-foreground">Optional — for your records only.</p>
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
          placeholder="04xx xxx xxx"
          className="rounded-xl border border-border bg-card px-4"
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
              ? "Adding guest..."
              : "Saving..."
            : mode === "create"
              ? "Add guest"
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
