"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  markAllocationPaid,
  markAllocationUnpaid,
} from "@/lib/actions/payments";

type AllocationActionsProps = {
  eventId: string;
  allocationId: string;
  isPaid: boolean;
};

export function AllocationActions({
  eventId,
  allocationId,
  isPaid,
}: AllocationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleMarkPaid() {
    setIsLoading(true);
    const result = await markAllocationPaid(eventId, allocationId);
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Marked as paid");
    router.refresh();
  }

  async function handleMarkUnpaid() {
    setIsLoading(true);
    const result = await markAllocationUnpaid(eventId, allocationId);
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Marked as unpaid");
    router.refresh();
  }

  if (isPaid) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full normal-case tracking-normal"
        disabled={isLoading}
        onClick={handleMarkUnpaid}
      >
        Mark unpaid
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      className="rounded-full normal-case tracking-normal"
      disabled={isLoading}
      onClick={handleMarkPaid}
    >
      Mark paid
    </Button>
  );
}
