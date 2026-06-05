import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { requireVerifiedOrganiser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await requireVerifiedOrganiser();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-muted-foreground">Account and app preferences</p>
      </div>

      <section className="buxmate-card space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Name
          </p>
          <p className="mt-1 font-medium">{session.user.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Email
          </p>
          <p className="mt-1 font-medium">{session.user.email}</p>
        </div>
      </section>

      <div className="mt-8">
        <EmptyState
          icon={Settings}
          title="More settings coming soon"
          description="Password changes, notifications and account preferences will appear here."
        />
      </div>
    </main>
  );
}
