"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  uploadGuestPhoto,
  uploadOrganiserPhoto,
} from "@/lib/actions/photos";
import { photoCaptionSchema } from "@/lib/validations/photo";

type PhotoUploadFormProps = {
  mode: "organiser" | "guest";
  eventId?: string;
  eventSlug?: string;
  disabled?: boolean;
  compact?: boolean;
};

export function PhotoUploadForm({
  mode,
  eventId,
  eventSlug,
  disabled = false,
  compact = false,
}: PhotoUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a photo to upload.");
      return;
    }

    const captionParsed = photoCaptionSchema.safeParse(caption);
    if (!captionParsed.success) {
      toast.error(captionParsed.error.issues[0]?.message ?? "Caption is invalid.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("caption", caption);

    setIsLoading(true);

    const result =
      mode === "organiser"
        ? await uploadOrganiserPhoto(eventId!, formData)
        : await uploadGuestPhoto(eventSlug!, formData);

    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Photo uploaded");
    setCaption("");
    setSelectedName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="buxmate-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ImagePlus className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold">Add photo</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "guest"
              ? "Upload from your phone — only people on this event can see it."
              : "Upload to the private event gallery."}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`photo-file-${mode}`}>Photo</Label>
          <Input
            ref={fileInputRef}
            id={`photo-file-${mode}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || isLoading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              setSelectedName(file?.name ?? null);
            }}
          />
          <p className="text-xs text-muted-foreground">
            JPEG, PNG or WebP · max 20 MB
            {selectedName ? ` · ${selectedName}` : ""}
          </p>
        </div>

        {!compact ? (
          <div className="space-y-2">
            <Label htmlFor={`photo-caption-${mode}`}>Caption (optional)</Label>
            <Textarea
              id={`photo-caption-${mode}`}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="A quick note about this moment"
              rows={2}
              maxLength={300}
              disabled={disabled || isLoading}
            />
          </div>
        ) : null}
      </div>

      <Button
        type="submit"
        className="mt-5 w-full rounded-full normal-case tracking-normal sm:w-auto"
        disabled={disabled || isLoading}
      >
        {isLoading ? "Uploading..." : "Add photo"}
      </Button>
    </form>
  );
}
