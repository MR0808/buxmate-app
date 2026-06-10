import { GuestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type GuestEmailRecipient = {
  id: string;
  name: string;
  email: string;
  inviteToken: string;
};

export async function getGuestEmailRecipients(
  eventId: string,
): Promise<GuestEmailRecipient[]> {
  const guests = await prisma.eventGuest.findMany({
    where: {
      eventId,
      status: { not: GuestStatus.ARCHIVED },
      email: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      inviteToken: true,
    },
    orderBy: { name: "asc" },
  });

  return guests
    .filter((guest): guest is typeof guest & { email: string } => {
      return Boolean(guest.email?.trim());
    })
    .map((guest) => ({
      id: guest.id,
      name: guest.name,
      email: guest.email.trim(),
      inviteToken: guest.inviteToken,
    }));
}
