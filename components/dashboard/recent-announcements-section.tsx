import Link from "next/link";
import { MessageSquare, Pin } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { PostTypeBadge } from "@/components/feed/post-type-badge";
import { formatPostDateTime } from "@/lib/posts/format";
import type { DashboardAnnouncement } from "@/lib/event-dashboard";
import type { FeedPostType } from "@/lib/posts/post-type-labels";

type RecentAnnouncementsSectionProps = {
  eventId: string;
  announcements: DashboardAnnouncement[];
  canManage: boolean;
};

export function RecentAnnouncementsSection({
  eventId,
  announcements,
  canManage,
}: RecentAnnouncementsSectionProps) {
  const basePath = `/events/${eventId}`;

  return (
    <DashboardSection
      title="Recent announcements"
      description="Latest updates for your guests."
      action={{ label: "Manage feed", href: `${basePath}/feed` }}
      empty={
        announcements.length === 0
          ? {
              icon: MessageSquare,
              title: "No announcements yet",
              description: "Post an update to keep guests in the loop.",
              action: canManage
                ? { label: "Post update", href: `${basePath}/feed` }
                : undefined,
            }
          : undefined
      }
    >
      {announcements.length > 0 ? (
        <div className="grid gap-3">
          {announcements.map((post) => (
            <Link
              key={post.id}
              href={`${basePath}/feed`}
              className="buxmate-card block p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <PostTypeBadge type={post.type as FeedPostType} />
                {post.pinned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Pin className="size-3.5" aria-hidden />
                    Pinned
                  </span>
                ) : null}
                <time
                  dateTime={post.createdAt.toISOString()}
                  className="ml-auto text-xs text-muted-foreground"
                >
                  {formatPostDateTime(post.createdAt)}
                </time>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed">
                {post.content}
              </p>
              {post.authorName ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.authorName}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </DashboardSection>
  );
}
