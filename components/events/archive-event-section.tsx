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
import { archiveEvent } from "@/lib/actions/events";

type ArchiveEventSectionProps = {
  eventId: string;
  eventName: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
};

export function ArchiveEventSection({
  eventId,
  eventName,
  status,
}: ArchiveEventSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (status === "ARCHIVED") {
    return (
      <section className="buxmate-card border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          This event is archived. It no longer appears in your active lists but
          remains in your account for reference.
        </p>
      </section>
    );
  }

  async function handleArchive() {
    setIsLoading(true);
    const result = await archiveEvent(eventId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Event archived");
    setOpen(false);
    router.push("/events");
    router.refresh();
  }

  return (
    <section className="buxmate-card border-destructive/20 p-6">
      <h3 className="font-heading text-lg font-semibold">Archive event</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Archive {eventName} when it is finished. Archived events are hidden from
        your active workflow but not permanently deleted.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="mt-4 rounded-full normal-case tracking-normal"
          >
            <Archive className="size-4" aria-hidden />
            Archive event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive this event?</DialogTitle>
            <DialogDescription>
              {eventName} will be marked as archived. You can still find it in
              your events list with an archived badge.
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
              {isLoading ? "Archiving..." : "Archive event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
