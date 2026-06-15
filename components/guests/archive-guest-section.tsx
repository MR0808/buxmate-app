"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { toast } from "sonner";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
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
import { archiveGuest } from "@/lib/actions/guests";

type ArchiveGuestSectionProps = {
  eventId: string;
  guestId: string;
  guestName: string;
  status: "INVITED" | "JOINED" | "DECLINED" | "ARCHIVED";
};

export function ArchiveGuestSection({
  eventId,
  guestId,
  guestName,
  status,
}: ArchiveGuestSectionProps) {
  const [open, setOpen] = useState(false);
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();

  if (status === "ARCHIVED") {
    return (
      <p className="text-sm text-muted-foreground">
        This guest is archived. Their invite link no longer works.
      </p>
    );
  }

  async function handleArchive() {
    start();
    const result = await archiveGuest(eventId, guestId);

    if (!result.success) {
      fail();
      toast.error(result.error);
      return;
    }

    toast.success("Guest archived");
    succeed({ href: `/events/${eventId}/guests` });
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
          variant="outline"
          className="rounded-full normal-case tracking-normal"
        >
          <Archive className="size-4" aria-hidden />
          Archive guest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive this guest?</DialogTitle>
          <DialogDescription>
            {guestName} will be removed from your active guest list and their
            invite link will stop working.
          </DialogDescription>
        </DialogHeader>
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
            variant="destructive"
            className="rounded-full normal-case tracking-normal"
            onClick={handleArchive}
            disabled={isBusy}
          >
            {submitLabel({
              idle: "Archive guest",
              submitting: "Archiving...",
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
