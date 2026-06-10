"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  removeOrganiserAvatar,
  uploadOrganiserAvatar,
} from "@/lib/actions/settings";
import { validateCoverFile } from "@/lib/validations/cover";

type AvatarUploadFormProps = {
  avatarSignedUrl: string | null;
  name: string;
};

export function AvatarUploadForm({
  avatarSignedUrl,
  name,
}: AvatarUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

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
    const result = await uploadOrganiserAvatar(formData);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Avatar updated");
    router.refresh();
  }

  async function handleRemove() {
    setIsRemoving(true);
    const result = await removeOrganiserAvatar();
    setIsRemoving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Avatar removed");
    router.refresh();
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <div className="relative size-20 overflow-hidden rounded-2xl border border-border/60 bg-muted">
        {avatarSignedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSignedUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-muted text-2xl font-semibold text-primary">
            {initial}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
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
          {avatarSignedUrl ? "Change photo" : "Upload photo"}
        </Button>
        {avatarSignedUrl ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            disabled={isRemoving}
            onClick={handleRemove}
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground sm:max-w-xs">
        JPEG, PNG or WebP. Max 10 MB. Shown on your account only.
      </p>
    </div>
  );
}
