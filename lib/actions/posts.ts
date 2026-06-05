"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { EventStatus, PostStatus } from "@/generated/prisma/client";
import { assertEventOwned } from "@/lib/activities";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  createPostSchema,
  type CreatePostInput,
} from "@/lib/validations/post";

type ActionResult =
  | { success: true; postId: string }
  | { success: false; error: string };

type SimpleResult =
  | { success: true }
  | { success: false; error: string };

async function getOwnedPostOrNotFound(
  eventId: string,
  postId: string,
  organiserId: string,
) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      eventId,
      event: { organiserId },
    },
    select: { id: true, status: true, pinned: true },
  });

  if (!post) {
    notFound();
  }

  return post;
}

async function revalidatePostPaths(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/feed`);
  if (event?.slug) {
    revalidatePath(`/e/${event.slug}`);
  }
}

export async function createPost(
  eventId: string,
  input: CreatePostInput,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = createPostSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const event = await assertEventOwned(eventId, session.user.id);

  if (event.status === EventStatus.ARCHIVED) {
    return {
      success: false,
      error: "Cannot post updates to an archived event.",
    };
  }

  const data = parsed.data;

  const post = await prisma.post.create({
    data: {
      eventId,
      authorUserId: session.user.id,
      type: data.type,
      content: data.content,
      pinned: data.pinned,
      status: PostStatus.ACTIVE,
    },
    select: { id: true },
  });

  await revalidatePostPaths(eventId);

  return { success: true, postId: post.id };
}

export async function setPostPinned(
  eventId: string,
  postId: string,
  pinned: boolean,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  const owned = await getOwnedPostOrNotFound(eventId, postId, session.user.id);

  if (owned.status === PostStatus.ARCHIVED) {
    return {
      success: false,
      error: "Archived posts cannot be pinned.",
    };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { pinned },
  });

  await revalidatePostPaths(eventId);

  return { success: true };
}

export async function archivePost(
  eventId: string,
  postId: string,
): Promise<SimpleResult> {
  const session = await requireVerifiedOrganiser();
  await assertEventOwned(eventId, session.user.id);
  await getOwnedPostOrNotFound(eventId, postId, session.user.id);

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: PostStatus.ARCHIVED,
      pinned: false,
    },
  });

  await revalidatePostPaths(eventId);

  return { success: true };
}
