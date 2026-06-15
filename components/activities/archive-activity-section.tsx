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
import { archiveActivity } from "@/lib/actions/activities";

type ArchiveActivitySectionProps = {
  eventId: string;
  activityId: string;
  activityName: string;
  status: "ACTIVE" | "ARCHIVED";
};

export function ArchiveActivitySection({
  eventId,
  activityId,
  activityName,
  status,
}: ArchiveActivitySectionProps) {
  const [open, setOpen] = useState(false);
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();

  if (status === "ARCHIVED") {
    return (
      <p className="text-sm text-muted-foreground">
        This activity is archived and hidden from the active itinerary.
      </p>
    );
  }

  async function handleArchive() {
    start();
    const result = await archiveActivity(eventId, activityId);

    if (!result.success) {
      fail();
      toast.error(result.error);
      return;
    }

    toast.success("Activity archived");
    succeed({ href: `/events/${eventId}/activities` });
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
          Archive activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive this activity?</DialogTitle>
          <DialogDescription>
            {activityName} will be removed from the active itinerary. You can
            still see it in the activities list with an archived badge.
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
              idle: "Archive activity",
              submitting: "Archiving...",
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
