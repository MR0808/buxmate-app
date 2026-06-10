"use server";

import { revalidatePath } from "next/cache";
import { auditLog } from "@/lib/audit";
import {
  buildOrganiserAvatarPath,
  deleteOrganiserAvatarFromStorage,
  isOrganiserAvatarPathForUser,
  uploadOrganiserAvatarToStorage,
} from "@/lib/avatars/storage";
import { validateCoverFile } from "@/lib/validations/cover";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";
import {
  notificationPreferencesSchema,
  updateProfileNameSchema,
} from "@/lib/validations/settings";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfileName(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = updateProfileNameSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid name.",
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  auditLog("profile.name_updated", { userId: session.user.id });
  revalidatePath("/settings");

  return { success: true };
}

export async function uploadOrganiserAvatar(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "Choose an image to upload." };
  }

  const validated = validateCoverFile(file);
  if (!validated.success) {
    return { success: false, error: validated.error };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (
    user?.image &&
    isOrganiserAvatarPathForUser(user.image, session.user.id)
  ) {
    await deleteOrganiserAvatarFromStorage(user.image);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = buildOrganiserAvatarPath(session.user.id, file.name);
  const uploaded = await uploadOrganiserAvatarToStorage(
    storagePath,
    buffer,
    validated.mimeType,
  );

  if (!uploaded.success) {
    return uploaded;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: storagePath },
  });

  auditLog("profile.avatar_updated", { userId: session.user.id });
  revalidatePath("/settings");

  return { success: true };
}

export async function removeOrganiserAvatar(): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (
    user?.image &&
    isOrganiserAvatarPathForUser(user.image, session.user.id)
  ) {
    await deleteOrganiserAvatarFromStorage(user.image);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  auditLog("profile.avatar_removed", { userId: session.user.id });
  revalidatePath("/settings");

  return { success: true };
}

export async function updateNotificationPreferences(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = notificationPreferencesSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid notification preferences." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  auditLog("profile.notifications_updated", { userId: session.user.id });
  revalidatePath("/settings");

  return { success: true };
}
