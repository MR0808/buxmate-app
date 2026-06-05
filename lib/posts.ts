import { PostStatus, type PostType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";

const postListSelect = {
  id: true,
  type: true,
  content: true,
  pinned: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { name: true },
  },
} as const;

export type OrganiserPostListItem = {
  id: string;
  type: PostType;
  content: string;
  pinned: boolean;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  authorName: string | null;
};

export type GuestPostListItem = {
  id: string;
  type: PostType;
  content: string;
  pinned: boolean;
  createdAt: Date;
};

const postOrder = [{ pinned: "desc" as const }, { createdAt: "desc" as const }];

export async function getOrganiserFeedPageData(eventId: string) {
  const session = await requireVerifiedOrganiser();

  const [activePosts, archivedCount] = await Promise.all([
    prisma.post.findMany({
      where: {
        eventId,
        status: PostStatus.ACTIVE,
        event: { organiserId: session.user.id },
      },
      orderBy: postOrder,
      select: postListSelect,
    }),
    prisma.post.count({
      where: {
        eventId,
        status: PostStatus.ARCHIVED,
        event: { organiserId: session.user.id },
      },
    }),
  ]);

  return {
    posts: activePosts.map((post) => ({
      id: post.id,
      type: post.type,
      content: post.content,
      pinned: post.pinned,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorName: post.author?.name ?? null,
    })),
    archivedCount,
  };
}

export async function getEventPostSummary(eventId: string) {
  const session = await requireVerifiedOrganiser();

  const [activeCount, latestAnnouncement] = await Promise.all([
    prisma.post.count({
      where: {
        eventId,
        status: PostStatus.ACTIVE,
        event: { organiserId: session.user.id },
      },
    }),
    prisma.post.findFirst({
      where: {
        eventId,
        status: PostStatus.ACTIVE,
        type: "ANNOUNCEMENT",
        event: { organiserId: session.user.id },
      },
      orderBy: postOrder,
      select: {
        id: true,
        content: true,
        pinned: true,
        createdAt: true,
      },
    }),
  ]);

  return { activeCount, latestAnnouncement };
}

export async function getGuestEventPosts(eventId: string): Promise<GuestPostListItem[]> {
  const posts = await prisma.post.findMany({
    where: {
      eventId,
      status: PostStatus.ACTIVE,
      authorUserId: { not: null },
    },
    orderBy: postOrder,
    select: {
      id: true,
      type: true,
      content: true,
      pinned: true,
      createdAt: true,
    },
  });

  return posts;
}
