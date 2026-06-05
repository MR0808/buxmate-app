"use server";

import { nanoid } from "nanoid";
import { requireVerifiedOrganiser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createEventSchema,
  slugifyEventName,
  type CreateEventInput,
} from "@/lib/validations/event";

type CreateEventResult =
  | { success: true; eventId: string }
  | { success: false; error: string };

export async function createEventAction(
  input: CreateEventInput,
): Promise<CreateEventResult> {
  const session = await requireVerifiedOrganiser();
  const parsed = createEventSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  const data = parsed.data;
  const baseSlug = slugifyEventName(data.name) || "event";
  const slug = `${baseSlug}-${nanoid(8)}`;

  const event = await prisma.event.create({
    data: {
      organiserId: session.user.id,
      name: data.name,
      slug,
      eventType: data.eventType,
      location: data.location || null,
      description: data.description || null,
      startsAt: data.startDate ? new Date(data.startDate) : null,
      endsAt: data.endDate ? new Date(data.endDate) : null,
    },
    select: { id: true },
  });

  return { success: true, eventId: event.id };
}
