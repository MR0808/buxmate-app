import { Pin } from "lucide-react";
import { PostTypeBadge } from "@/components/feed/post-type-badge";
import { formatPostDateTime } from "@/lib/posts/format";
import type { FeedPostType } from "@/lib/posts/post-type-labels";
import { cn } from "@/lib/utils";

type PostCardProps = {
  type: FeedPostType;
  content: string;
  pinned: boolean;
  createdAt: Date;
  authorName?: string | null;
  actions?: React.ReactNode;
  className?: string;
};

export function PostCard({
  type,
  content,
  pinned,
  createdAt,
  authorName,
  actions,
  className,
}: PostCardProps) {
  return (
    <article
      className={cn(
        "buxmate-card p-5 sm:p-6",
        pinned && "ring-1 ring-primary/25",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PostTypeBadge type={type} />
          {pinned ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <Pin className="size-3.5" aria-hidden />
              Pinned
            </span>
          ) : null}
        </div>
        <time
          dateTime={createdAt.toISOString()}
          className="text-xs text-muted-foreground"
        >
          {formatPostDateTime(createdAt)}
        </time>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{content}</p>

      {authorName ? (
        <p className="mt-4 text-xs text-muted-foreground">Posted by {authorName}</p>
      ) : null}

      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
}
