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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (status === "ARCHIVED") {
    return (
      <p className="text-sm text-muted-foreground">
        This guest is archived. Their invite link no longer works.
      </p>
    );
  }

  async function handleArchive() {
    setIsLoading(true);
    const result = await archiveGuest(eventId, guestId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Guest archived");
    setOpen(false);
    router.push(`/events/${eventId}/guests`);
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
            {isLoading ? "Archiving..." : "Archive guest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
