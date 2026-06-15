"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { setGuestOfHonour } from "@/lib/actions/guests";

type GuestOfHonourToggleProps = {
  eventId: string;
  guestId: string;
  initial: boolean;
  disabled?: boolean;
};

export function GuestOfHonourToggle({
  eventId,
  guestId,
  initial,
  disabled = false,
}: GuestOfHonourToggleProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);

  async function handleChange(next: boolean) {
    setChecked(next);
    setIsLoading(true);

    const result = await setGuestOfHonour(eventId, guestId, next);
    setIsLoading(false);

    if (!result.success) {
      setChecked(initial);
      toast.error(result.error);
      return;
    }

    toast.success(
      next ? "Marked as guest of honour" : "Removed guest of honour",
    );
    router.refresh();
  }

  return (
    <label className="flex items-start gap-3 rounded-xl border border-border/70 p-4">
      <Checkbox
        checked={checked}
        disabled={disabled || isLoading}
        onCheckedChange={(value) => handleChange(value === true)}
      />
      <span className="text-sm">
        <Label className="font-medium">Guest of honour</Label>
        <span className="mt-0.5 block text-muted-foreground">
          Exclude from shared costs like group gifts when you split payments.
        </span>
      </span>
    </label>
  );
}
