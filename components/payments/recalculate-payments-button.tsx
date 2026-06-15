"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { recalculateEventPaymentAllocations } from "@/lib/actions/payments";

type RecalculatePaymentsButtonProps = {
  eventId: string;
};

export function RecalculatePaymentsButton({
  eventId,
}: RecalculatePaymentsButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const result = await recalculateEventPaymentAllocations(eventId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (result.flagged && result.flagged > 0) {
      toast.success(
        `Recalculated. ${result.flagged} paid allocation${result.flagged === 1 ? "" : "s"} flagged for review.`,
      );
    } else {
      toast.success("Payment splits recalculated");
    }

    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full normal-case tracking-normal"
      disabled={isLoading}
      onClick={handleClick}
    >
      <RefreshCw className="size-4" aria-hidden />
      {isLoading ? "Recalculating..." : "Recalculate"}
    </Button>
  );
}
