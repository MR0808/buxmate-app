import { notFound } from "next/navigation";
import { requireVerifiedOrganiser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function getOrganiserEvent(eventId: string) {
  const session = await requireVerifiedOrganiser();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organiserId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      eventType: true,
      location: true,
      description: true,
      status: true,
      startsAt: true,
      endsAt: true,
      paymentInstructions: true,
    },
  });

  if (!event) {
    notFound();
  }

  return event;
}
