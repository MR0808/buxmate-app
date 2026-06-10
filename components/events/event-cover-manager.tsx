"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { removeEventCover, uploadEventCover } from "@/lib/actions/covers";
import { validateCoverFile } from "@/lib/validations/cover";

type EventCoverManagerProps = {
  eventId: string;
  coverSignedUrl: string | null;
  disabled?: boolean;
};

export function EventCoverManager({
  eventId,
  coverSignedUrl,
  disabled = false,
}: EventCoverManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validated = validateCoverFile(file);
    if (!validated.success) {
      toast.error(validated.error);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    setIsUploading(true);
    const result = await uploadEventCover(eventId, formData);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(coverSignedUrl ? "Cover image updated" : "Cover image uploaded");
    router.refresh();
  }

  async function handleRemove() {
    setIsRemoving(true);
    const result = await removeEventCover(eventId);
    setIsRemoving(false);
    setConfirmRemove(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Cover image removed");
    router.refresh();
  }

  return (
    <section className="buxmate-card overflow-hidden">
      <div className="p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold">Cover image</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shown on your event dashboard, guest invite, and event page.
        </p>
      </div>

      <EventCoverImage
        signedUrl={coverSignedUrl}
        height="lg"
        overlay={false}
      />

      {!disabled ? (
        <div className="flex flex-wrap gap-2 border-t border-border/60 p-6 sm:p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-4" aria-hidden />
            {coverSignedUrl ? "Replace image" : "Upload image"}
          </Button>
          {coverSignedUrl ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full normal-case tracking-normal"
              disabled={isUploading || isRemoving}
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="size-4" aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove cover image?</DialogTitle>
            <DialogDescription>
              The image will be deleted from storage. You can upload a new one
              anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-full normal-case tracking-normal"
              onClick={() => setConfirmRemove(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full normal-case tracking-normal"
              disabled={isRemoving}
              onClick={handleRemove}
            >
              {isRemoving ? "Removing..." : "Remove image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
