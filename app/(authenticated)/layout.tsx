import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { requireVerifiedOrganiser } from "@/lib/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireVerifiedOrganiser();

  return (
    <AppShell userName={session.user.name} userEmail={session.user.email}>
      {children}
    </AppShell>
  );
}
