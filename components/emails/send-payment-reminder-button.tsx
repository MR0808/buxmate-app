"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  sendPaymentReminderEmail,
  sendPaymentReminderEmailsBulk,
  type BulkEmailActionResult,
} from "@/lib/actions/emails";

type SendPaymentReminderButtonProps = {
  eventId: string;
  mode: "guest" | "bulk";
  guestId?: string;
  guestName?: string;
  outstandingCents?: number;
  disabled?: boolean;
};

export function SendPaymentReminderButton({
  eventId,
  mode,
  guestId,
  guestName,
  outstandingCents = 0,
  disabled,
}: SendPaymentReminderButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (mode === "guest" && outstandingCents <= 0) {
    return null;
  }

  async function handleSend() {
    setIsLoading(true);
    const result =
      mode === "bulk"
        ? await sendPaymentReminderEmailsBulk(eventId)
        : await sendPaymentReminderEmail(eventId, guestId!);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (mode === "bulk") {
      const bulk = result as BulkEmailActionResult;
      if (bulk.success) {
        const parts = [`${bulk.sent} sent`];
        if (bulk.failed > 0) parts.push(`${bulk.failed} failed`);
        if (bulk.skipped > 0) parts.push(`${bulk.skipped} skipped`);
        toast.success(`Payment reminders: ${parts.join(", ")}`);
      }
    } else {
      toast.success("Payment reminder sent");
    }

    setOpen(false);
  }

  const bulk = mode === "bulk";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={bulk ? "outline" : "ghost"}
          size="sm"
          className="rounded-full normal-case tracking-normal"
          disabled={disabled || isLoading}
        >
          <Mail className="size-4" aria-hidden />
          {bulk ? "Remind all owing" : "Send reminder"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {bulk ? "Send payment reminders?" : `Remind ${guestName}?`}
          </DialogTitle>
          <DialogDescription>
            {bulk
              ? "This emails every guest with an outstanding balance who has an email address. Archived guests are skipped."
              : "Send a friendly payment reminder to this guest. Buxmate does not process payments."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full normal-case tracking-normal"
            disabled={isLoading}
            onClick={handleSend}
          >
            {isLoading ? "Sending..." : "Send reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
