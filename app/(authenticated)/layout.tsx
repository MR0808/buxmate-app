import { AppShell } from "@/components/layout/app-shell";
import { requireVerifiedOrganiser } from "@/lib/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireVerifiedOrganiser();

  return (
    <AppShell
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {children}
    </AppShell>
  );
}
