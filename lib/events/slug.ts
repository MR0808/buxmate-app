import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { slugifyEventName } from "@/lib/validations/event";

const shortSuffix = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 4);

export async function generateUniqueEventSlug(name: string): Promise<string> {
  const base = slugifyEventName(name) || "event";
  const taken = await prisma.event.findUnique({
    where: { slug: base },
    select: { id: true },
  });

  if (!taken) {
    return base;
  }

  let candidate = `${base}-${shortSuffix()}`;
  let attempts = 0;

  while (attempts < 10) {
    const conflict = await prisma.event.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!conflict) {
      return candidate;
    }
    candidate = `${base}-${shortSuffix()}`;
    attempts += 1;
  }

  return `${base}-${shortSuffix()}${shortSuffix()}`;
}
