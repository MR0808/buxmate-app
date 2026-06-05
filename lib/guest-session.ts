import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const GUEST_SESSION_COOKIE = "buxmate_guest_session";
const SESSION_VERSION = "v1";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

function getSessionSecret(): string {
  const secret =
    process.env.GUEST_SESSION_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing GUEST_SESSION_SECRET or BETTER_AUTH_SECRET");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export type GuestSessionPayload = {
  guestId: string;
  eventSlug: string;
  exp: number;
};

export function createGuestSessionToken(
  guestId: string,
  eventSlug: string,
): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${SESSION_VERSION}.${guestId}.${eventSlug}.${exp}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyGuestSessionToken(
  token: string,
): GuestSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== SESSION_VERSION) {
    return null;
  }

  const [, guestId, eventSlug, expStr, signature] = parts;
  const payload = `${SESSION_VERSION}.${guestId}.${eventSlug}.${expStr}`;
  const expected = signPayload(payload);

  try {
    const sigBuf = Buffer.from(signature, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  if (!guestId || !eventSlug) {
    return null;
  }

  return { guestId, eventSlug, exp };
}

export async function setGuestSessionCookie(
  guestId: string,
  eventSlug: string,
) {
  const cookieStore = await cookies();
  const token = createGuestSessionToken(guestId, eventSlug);

  cookieStore.set(GUEST_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearGuestSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_SESSION_COOKIE);
}

export async function readGuestSessionCookie(): Promise<GuestSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyGuestSessionToken(token);
}
