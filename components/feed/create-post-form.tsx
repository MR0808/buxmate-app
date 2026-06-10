"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/actions/posts";
import {
  POST_TYPE_LABELS,
  type FeedPostType,
} from "@/lib/posts/post-type-labels";
import {
  POST_TYPES,
  createPostSchema,
  type CreatePostInput,
} from "@/lib/validations/post";

type CreatePostFormProps = {
  eventId: string;
  disabled?: boolean;
};

const defaultForm: CreatePostInput = {
  type: "ANNOUNCEMENT",
  content: "",
  pinned: false,
  sendByEmail: false,
};

export function CreatePostForm({ eventId, disabled }: CreatePostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePostInput, string>>
  >({});
  const [form, setForm] = useState<CreatePostInput>(defaultForm);

  function updateField<K extends keyof CreatePostInput>(
    key: K,
    value: CreatePostInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createPostSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CreatePostInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof CreatePostInput]) {
          fieldErrors[key as keyof CreatePostInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const result = await createPost(eventId, parsed.data);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if ("emailWarning" in result && result.emailWarning) {
      toast.warning(`Posted, but email issue: ${result.emailWarning}`);
    } else if ("emailsSent" in result && result.emailsSent) {
      toast.success(`Update posted and emailed ${result.emailsSent} guest${result.emailsSent === 1 ? "" : "s"}`);
    } else {
      toast.success("Update posted");
    }
    setForm(defaultForm);
    router.refresh();
  }

  const contentLength = form.content.length;

  return (
    <form onSubmit={handleSubmit} className="buxmate-card p-5 sm:p-6">
      <h3 className="font-heading text-lg font-semibold">Post update</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Share news with your guests — not a chat thread.
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="post-type">Type</Label>
          <Select
            value={form.type}
            onValueChange={(value) =>
              updateField("type", value as FeedPostType)
            }
            disabled={disabled || isLoading}
          >
            <SelectTrigger id="post-type" className="w-full sm:max-w-xs">
              <SelectValue placeholder="Choose type" />
            </SelectTrigger>
            <SelectContent>
              {POST_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {POST_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type ? (
            <p className="text-sm text-destructive">{errors.type}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-content">Message</Label>
          <Textarea
            id="post-content"
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
            placeholder="e.g. Meet at the car park at 9am Saturday."
            rows={4}
            maxLength={1000}
            disabled={disabled || isLoading}
          />
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {errors.content ? (
                <span className="text-destructive">{errors.content}</span>
              ) : (
                "Required — max 1,000 characters"
              )}
            </span>
            <span>{contentLength}/1000</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="post-pinned"
              checked={form.pinned}
              onCheckedChange={(checked) =>
                updateField("pinned", checked === true)
              }
              disabled={disabled || isLoading}
            />
            <Label htmlFor="post-pinned" className="font-normal">
              Pin to top
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="post-send-email"
              checked={form.sendByEmail}
              onCheckedChange={(checked) =>
                updateField("sendByEmail", checked === true)
              }
              disabled={disabled || isLoading}
            />
            <Label htmlFor="post-send-email" className="font-normal">
              Send by email
            </Label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="mt-6 w-full rounded-full normal-case tracking-normal sm:w-auto"
        disabled={disabled || isLoading}
      >
        {isLoading ? "Posting..." : "Post update"}
      </Button>
    </form>
  );
}
