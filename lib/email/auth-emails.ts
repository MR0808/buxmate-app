import { VerifyEmail } from "@/emails/verify-email";
import { PasswordResetEmail } from "@/emails/password-reset-email";
import { MagicLinkEmail } from "@/emails/magic-link-email";
import { getAppUrl } from "@/lib/email/app-url";
import { sendEmail } from "@/lib/email/send-email";

type AuthUser = {
  email: string;
  name: string;
};

export function buildVerificationUrl(token: string, callbackPath = "/login?verified=1") {
  const appUrl = getAppUrl();
  const callbackURL = encodeURIComponent(`${appUrl}${callbackPath}`);
  return `${appUrl}/verify-email?token=${encodeURIComponent(token)}&callbackURL=${callbackURL}`;
}

export async function sendOrganiserVerificationEmail({
  user,
  token,
}: {
  user: AuthUser;
  token: string;
}) {
  const verifyUrl = buildVerificationUrl(token);

  void sendEmail({
    to: user.email,
    subject: "Verify your Buxmate account",
    react: VerifyEmail({ name: user.name, verifyUrl }),
  });
}

export async function sendOrganiserPasswordResetEmail({
  user,
  url,
}: {
  user: AuthUser;
  url: string;
}) {
  void sendEmail({
    to: user.email,
    subject: "Reset your Buxmate password",
    react: PasswordResetEmail({ name: user.name, resetUrl: url }),
  });
}

export async function sendOrganiserMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  void sendEmail({
    to: email,
    subject: "Your Buxmate sign-in link",
    react: MagicLinkEmail({ signInUrl: url }),
  });
}
