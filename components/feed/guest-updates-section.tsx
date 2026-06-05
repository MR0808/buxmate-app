import { PostCard } from "@/components/feed/post-card";
import type { GuestPostListItem } from "@/lib/posts";
import type { FeedPostType } from "@/lib/posts/post-type-labels";

type GuestUpdatesSectionProps = {
  posts: GuestPostListItem[];
};

export function GuestUpdatesSection({ posts }: GuestUpdatesSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">Updates</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        News and announcements from your organiser.
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
        <p className="buxmate-card mt-4 p-6 text-sm text-muted-foreground">
          No updates yet. Check back when the organiser posts something new.
        </p>
      )}
    </section>
  );
}
