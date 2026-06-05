import { Badge } from "@/components/ui/badge";
import {
  POST_TYPE_LABELS,
  type FeedPostType,
} from "@/lib/posts/post-type-labels";
import { cn } from "@/lib/utils";

type PostTypeBadgeProps = {
  type: FeedPostType;
  className?: string;
};

export function PostTypeBadge({ type, className }: PostTypeBadgeProps) {
  return (
    <Badge
      variant={type === "ANNOUNCEMENT" ? "default" : "secondary"}
      className={cn("rounded-full font-normal", className)}
    >
      {POST_TYPE_LABELS[type]}
    </Badge>
  );
}
