"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { toast } from "sonner";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copyAnnouncements, setCopyAnnouncements] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDuplicate() {
    setIsLoading(true);
    const result = await duplicateEvent(eventId, { copyAnnouncements });
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Event duplicated as draft");
    setOpen(false);
    router.push(`/events/${result.eventId}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-4">
          <Checkbox
            checked={copyAnnouncements}
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full normal-case tracking-normal"
            onClick={handleDuplicate}
            disabled={isLoading}
          >
            {isLoading ? "Duplicating..." : "Duplicate as draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
