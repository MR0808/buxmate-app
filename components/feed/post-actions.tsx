"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, Pin, PinOff } from "lucide-react";
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
import { archivePost, setPostPinned } from "@/lib/actions/posts";

type PostActionsProps = {
  eventId: string;
  postId: string;
  pinned: boolean;
};

export function PostActions({ eventId, postId, pinned }: PostActionsProps) {
  const router = useRouter();
  const [pinLoading, setPinLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  async function handleTogglePin() {
    setPinLoading(true);
    const result = await setPostPinned(eventId, postId, !pinned);
    setPinLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(pinned ? "Unpinned" : "Pinned to top");
    router.refresh();
  }

  async function handleArchive() {
    setArchiveLoading(true);
    const result = await archivePost(eventId, postId);
    setArchiveLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Update archived");
    setArchiveOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full normal-case tracking-normal"
        disabled={pinLoading || archiveLoading}
        onClick={handleTogglePin}
      >
        {pinned ? (
          <PinOff className="size-4" aria-hidden />
        ) : (
          <Pin className="size-4" aria-hidden />
        )}
        {pinned ? "Unpin" : "Pin to top"}
      </Button>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full normal-case tracking-normal text-muted-foreground"
            disabled={pinLoading || archiveLoading}
          >
            <Archive className="size-4" aria-hidden />
            Archive
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive this update?</DialogTitle>
            <DialogDescription>
              Guests will no longer see it on the event page. You can post a new
              update anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full normal-case tracking-normal"
              onClick={() => setArchiveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full normal-case tracking-normal"
              disabled={archiveLoading}
              onClick={handleArchive}
            >
              {archiveLoading ? "Archiving..." : "Archive update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
