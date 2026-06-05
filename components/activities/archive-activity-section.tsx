"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive } from "lucide-react";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (status === "ARCHIVED") {
    return (
      <p className="text-sm text-muted-foreground">
        This activity is archived and hidden from the active itinerary.
      </p>
    );
  }

  async function handleArchive() {
    setIsLoading(true);
    const result = await archiveActivity(eventId, activityId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Activity archived");
    setOpen(false);
    router.push(`/events/${eventId}/activities`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-full normal-case tracking-normal"
            onClick={handleArchive}
            disabled={isLoading}
          >
            {isLoading ? "Archiving..." : "Archive activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
