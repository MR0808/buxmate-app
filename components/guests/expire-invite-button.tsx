"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, RotateCcw } from "lucide-react";
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
  expireGuestInviteLink,
  reactivateGuestInviteLink,
} from "@/lib/actions/guests";

type ExpireInviteButtonProps = {
  eventId: string;
  guestId: string;
  mode?: "expire" | "reactivate";
};

export function ExpireInviteButton({
  eventId,
  guestId,
  mode = "expire",
}: ExpireInviteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isReactivate = mode === "reactivate";

  async function handleConfirm() {
    setIsLoading(true);
    const result = isReactivate
      ? await reactivateGuestInviteLink(eventId, guestId)
      : await expireGuestInviteLink(eventId, guestId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      isReactivate ? "Invite link reactivated" : "Invite link expired",
    );
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full normal-case tracking-normal"
        >
          {isReactivate ? (
            <RotateCcw className="size-4" aria-hidden />
          ) : (
            <Ban className="size-4" aria-hidden />
          )}
          {isReactivate ? "Reactivate link" : "Expire link"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReactivate ? "Reactivate invite link?" : "Expire invite link?"}
          </DialogTitle>
          <DialogDescription>
            {isReactivate
              ? "The current link will work again immediately. Guests can open it without a new token."
              : "The current link will stop working immediately. Regenerate a new link to share with this guest."}
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
            variant={isReactivate ? "default" : "destructive"}
            className="rounded-full normal-case tracking-normal"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? "Working..."
              : isReactivate
                ? "Reactivate link"
                : "Expire link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
