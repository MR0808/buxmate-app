"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearAllocationOverride,
  overrideAllocation,
} from "@/lib/actions/payments";

type AllocationOverrideFormProps = {
  eventId: string;
  allocationId: string;
  currentAmountCents: number;
  isManualOverride: boolean;
};

export function AllocationOverrideForm({
  eventId,
  allocationId,
  currentAmountCents,
  isManualOverride,
}: AllocationOverrideFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState((currentAmountCents / 100).toFixed(2));
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);
    const result = await overrideAllocation(eventId, allocationId, {
      amountOwed: Number.parseFloat(amount),
      overrideReason: reason,
    });
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Manual override saved");
    router.refresh();
  }

  async function handleClear() {
    setIsLoading(true);
    const result = await clearAllocationOverride(eventId, allocationId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Override cleared — amount recalculated");
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
      <p className="text-sm font-medium">Manual override</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`override-${allocationId}`}>Amount owed (AUD)</Label>
          <Input
            id={`override-${allocationId}`}
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl border border-border bg-card px-4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`reason-${allocationId}`}>Reason (optional)</Label>
          <Input
            id={`reason-${allocationId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Paid extra for drinks"
            className="rounded-xl border border-border bg-card px-4"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="rounded-full normal-case tracking-normal"
          disabled={isLoading}
          onClick={handleSave}
        >
          Save override
        </Button>
        {isManualOverride ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            disabled={isLoading}
            onClick={handleClear}
          >
            Clear override
          </Button>
        ) : null}
      </div>
    </div>
  );
}
