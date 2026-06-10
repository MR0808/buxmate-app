import { notFound } from "next/navigation";
import { getSignedAvatarUrl } from "@/lib/avatars/storage";
import { prisma } from "@/lib/prisma";
import { requireVerifiedOrganiser } from "@/lib/session";

export async function getOrganiserProfile() {
  const session = await requireVerifiedOrganiser();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      notifyRsvpUpdates: true,
      notifyGuestJoins: true,
      notifyPaymentUpdates: true,
    },
  });

  if (!user) {
    notFound();
  }

  const avatarSignedUrl = user.image
    ? await getSignedAvatarUrl(user.image)
    : null;

  return {
    ...user,
    avatarSignedUrl,
  };
}
