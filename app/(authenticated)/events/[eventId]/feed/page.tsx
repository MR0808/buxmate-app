import { MessageSquare } from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { CreatePostForm } from "@/components/feed/create-post-form";
import { PostActions } from "@/components/feed/post-actions";
import { PostCard } from "@/components/feed/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrganiserEvent } from "@/lib/events";
import { OrganiserPhotosSection } from "@/components/photos/organiser-photos-section";
import { getOrganiserEventPhotos } from "@/lib/photos";
import { getOrganiserFeedPageData } from "@/lib/posts";
import type { FeedPostType } from "@/lib/posts/post-type-labels";

export default async function EventFeedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, { posts, archivedCount }, photos] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserFeedPageData(eventId),
    getOrganiserEventPhotos(eventId),
  ]);

  const canPost = event.status !== EventStatus.ARCHIVED;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-primary">{event.name}</p>
        <h2 className="mt-1 font-heading text-xl font-semibold">Updates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Announcements and notes for your guests — not a chat thread.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <CreatePostForm eventId={eventId} disabled={!canPost} />

        <section>
          <h3 className="font-heading text-lg font-semibold">Posted updates</h3>
          {archivedCount > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {archivedCount} archived update{archivedCount === 1 ? "" : "s"} hidden
              from guests
            </p>
          ) : null}

          {posts.length > 0 ? (
            <div className="mt-4 space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  type={post.type as FeedPostType}
                  content={post.content}
                  pinned={post.pinned}
                  createdAt={post.createdAt}
                  authorName={post.authorName}
                  actions={
                    canPost ? (
                      <PostActions
                        eventId={eventId}
                        postId={post.id}
                        pinned={post.pinned}
                      />
                    ) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-4"
              icon={MessageSquare}
              title="No updates yet"
              description="Post an announcement — guests will see it on their event page."
            />
          )}
        </section>
      </div>

      <OrganiserPhotosSection
        eventId={eventId}
        photos={photos.slice(0, 6)}
        canUpload={canPost}
        showViewAllLink={photos.length > 0}
        compact
      />
    </main>
  );
}
