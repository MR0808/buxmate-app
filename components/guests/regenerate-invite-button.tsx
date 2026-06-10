"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
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
import { regenerateGuestInviteToken } from "@/lib/actions/guests";
import { buildGuestInviteUrl } from "@/lib/guests/invite-url";

type RegenerateInviteButtonProps = {
  eventId: string;
  guestId: string;
  onRegenerated?: (inviteUrl: string) => void;
};

export function RegenerateInviteButton({
  eventId,
  guestId,
  onRegenerated,
}: RegenerateInviteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegenerate() {
    setIsLoading(true);
    const result = await regenerateGuestInviteToken(eventId, guestId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const inviteUrl = buildGuestInviteUrl(result.inviteToken);
    toast.success("New invite link generated");
    setOpen(false);
    onRegenerated?.(inviteUrl);
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
          <RefreshCw className="size-4" aria-hidden />
          Regenerate link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate invite link?</DialogTitle>
          <DialogDescription>
            The current link will stop working immediately. Share the new link
            with this guest, or send an invite email from their profile.
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
            className="rounded-full normal-case tracking-normal"
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            {isLoading ? "Regenerating..." : "Regenerate link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
