"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { duplicateEvent } from "@/lib/actions/events";

type DuplicateEventButtonProps = {
  eventId: string;
  eventName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
};

export function DuplicateEventButton({
  eventId,
  eventName,
  variant = "outline",
  size = "sm",
}: DuplicateEventButtonProps) {
  const [open, setOpen] = useState(false);
  const [copyAnnouncements, setCopyAnnouncements] = useState(false);
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();

  async function handleDuplicate() {
    start();
    const result = await duplicateEvent(eventId, { copyAnnouncements });

    if (!result.success) {
      fail();
      toast.error(result.error);
      return;
    }

    toast.success("Event duplicated as draft");
    succeed({ href: `/events/${result.eventId}` });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isBusy) setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className="rounded-full normal-case tracking-normal"
        >
          <Copy className="size-4" aria-hidden />
          Duplicate event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate event?</DialogTitle>
          <DialogDescription>
            Create a draft copy of <strong>{eventName}</strong> with activities,
            guests, and payment items. RSVPs, payment statuses, and photos are not
            copied. New invite links will be generated.
          </DialogDescription>
        </DialogHeader>
        <label
          className={`flex items-start gap-3 rounded-xl border border-border/70 p-4 ${isBusy ? "pointer-events-none opacity-60" : ""}`}
        >
          <Checkbox
            checked={copyAnnouncements}
            disabled={isBusy}
            onCheckedChange={(checked) =>
              setCopyAnnouncements(checked === true)
            }
          />
          <span className="text-sm">
            <span className="font-medium">Copy announcements</span>
            <span className="mt-0.5 block text-muted-foreground">
              Include active posts from the event feed.
            </span>
          </span>
        </label>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setOpen(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full normal-case tracking-normal"
            onClick={handleDuplicate}
            disabled={isBusy}
          >
            {submitLabel({
              idle: "Duplicate as draft",
              submitting: "Duplicating...",
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
