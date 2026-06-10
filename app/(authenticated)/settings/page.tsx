import type { Metadata } from "next";
import { ProfileNameForm } from "@/components/settings/profile-name-form";
import { AvatarUploadForm } from "@/components/settings/avatar-upload-form";
import { ChangeEmailForm } from "@/components/settings/change-email-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { getOrganiserProfile } from "@/lib/user";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const profile = await getOrganiserProfile();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Your account, security, and notification preferences
        </p>
      </div>

      <section className="buxmate-card space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="font-heading text-lg font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How you appear as an organiser in Buxmate.
          </p>
        </div>
        <AvatarUploadForm
          avatarSignedUrl={profile.avatarSignedUrl}
          name={profile.name}
        />
        <ProfileNameForm initialName={profile.name} />
      </section>

      <section className="buxmate-card mt-6 space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="font-heading text-lg font-semibold">Email</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Change the email you use to sign in.
          </p>
        </div>
        <ChangeEmailForm currentEmail={profile.email} />
      </section>

      <section className="buxmate-card mt-6 space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="font-heading text-lg font-semibold">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your password. Other sessions will be signed out.
          </p>
        </div>
        <ChangePasswordForm />
      </section>

      <section className="buxmate-card mt-6 space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="font-heading text-lg font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose what you want to hear about. Stored for when in-app and email
            alerts expand.
          </p>
        </div>
        <NotificationPreferencesForm
          initial={{
            notifyRsvpUpdates: profile.notifyRsvpUpdates,
            notifyGuestJoins: profile.notifyGuestJoins,
            notifyPaymentUpdates: profile.notifyPaymentUpdates,
          }}
        />
      </section>
    </main>
  );
}
