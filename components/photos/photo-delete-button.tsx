"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
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
  archiveGuestPhoto,
  archiveOrganiserPhoto,
} from "@/lib/actions/photos";

type PhotoDeleteButtonProps = {
  mode: "organiser" | "guest";
  photoId: string;
  eventId?: string;
  eventSlug?: string;
};

export function PhotoDeleteButton({
  mode,
  photoId,
  eventId,
  eventSlug,
}: PhotoDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleArchive() {
    setIsLoading(true);
    const result =
      mode === "organiser"
        ? await archiveOrganiserPhoto(eventId!, photoId)
        : await archiveGuestPhoto(eventSlug!, photoId);

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Photo removed");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full normal-case tracking-normal text-muted-foreground"
        >
          <Trash2 className="size-4" aria-hidden />
          Remove
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove this photo?</DialogTitle>
          <DialogDescription>
            {mode === "guest"
              ? "This removes your photo from the event gallery."
              : "This removes the photo from the event gallery for everyone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full normal-case tracking-normal"
            disabled={isLoading}
            onClick={handleArchive}
          >
            {isLoading ? "Removing..." : "Remove photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
