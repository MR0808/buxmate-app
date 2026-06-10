import { Megaphone } from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { GuestPostListItem } from "@/lib/posts";
import type { FeedPostType } from "@/lib/posts/post-type-labels";

type GuestUpdatesSectionProps = {
  posts: GuestPostListItem[];
};

export function GuestUpdatesSection({ posts }: GuestUpdatesSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">Announcements</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        News and updates from your organiser.
      </p>

      {posts.length > 0 ? (
        <div className="mt-4 space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              type={post.type as FeedPostType}
              content={post.content}
              pinned={post.pinned}
              createdAt={post.createdAt}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          icon={Megaphone}
          title="No updates yet"
          description="Check back when the organiser posts an announcement."
        />
      )}
    </section>
  );
}
