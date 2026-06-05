import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function requireSession(redirectTo = "/login") {
  const session = await getSession();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}

export async function requireVerifiedOrganiser() {
  const session = await requireSession();

  if (!session.user.emailVerified) {
    const email = encodeURIComponent(session.user.email);
    redirect(`/check-email?email=${email}`);
  }

  return session;
}
