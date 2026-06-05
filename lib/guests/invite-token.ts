import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";

const generateToken = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  32,
);

export async function generateUniqueInviteToken(): Promise<string> {
  let attempts = 0;

  while (attempts < 10) {
    const token = generateToken();
    const existing = await prisma.eventGuest.findUnique({
      where: { inviteToken: token },
      select: { id: true },
    });
    if (!existing) {
      return token;
    }
    attempts += 1;
  }

  return `${generateToken()}${generateToken().slice(0, 8)}`;
}
