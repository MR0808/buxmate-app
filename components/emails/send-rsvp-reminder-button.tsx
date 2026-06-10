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
import { sendRsvpReminderEmailsBulk } from "@/lib/actions/emails";

type SendRsvpReminderButtonProps = {
  eventId: string;
  disabled?: boolean;
  className?: string;
};

export function SendRsvpReminderButton({
  eventId,
  disabled,
  className,
}: SendRsvpReminderButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    setIsLoading(true);
    const result = await sendRsvpReminderEmailsBulk(eventId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const parts = [`${result.sent} sent`];
    if (result.failed > 0) parts.push(`${result.failed} failed`);
    if (result.skipped > 0) parts.push(`${result.skipped} skipped`);
    toast.success(`RSVP reminders: ${parts.join(", ")}`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className ?? "rounded-full normal-case tracking-normal"}
          disabled={disabled || isLoading}
        >
          <Mail className="size-4" aria-hidden />
          Send RSVP reminder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send RSVP reminders?</DialogTitle>
          <DialogDescription>
            This emails guests who still need to RSVP and have an email address.
            Archived guests are skipped. Each guest only receives one email.
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
            {isLoading ? "Sending..." : "Send reminders"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
